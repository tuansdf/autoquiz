import { GoogleGenAI } from "@google/genai";
import { v4 } from "uuid";
import { z } from "zod";
import { Env } from "../../env.js";
import { logger } from "../../utils/logger";
import { remoteConfigs } from "../config/remote-configs";

const ai = new GoogleGenAI({ apiKey: Env.GEMINI_API_KEY });

const responseSchema = z
  .object({
    questions: z
      .array(
        z
          .object({
            text: z.string().describe("A clear and concise question derived from the dataset."),
            answers: z
              .array(
                z
                  .object({
                    text: z.string().describe("The text of this answer option."),
                    correct: z.boolean().describe("If this option is correct"),
                  })
                  .strict(),
              )
              .min(4)
              .max(4)
              .describe("Exactly 4 answer options for the question."),
            explanation: z.string().describe("Explanation of why the answer is correct."),
          })
          .strict(),
      )
      .min(1)
      .describe("An array of quiz questions derived from the dataset."),
  })
  .describe("Multiple Choice Questions Dataset");

const responseSchemaJson = z.toJSONSchema(responseSchema);

export type Response = z.infer<typeof responseSchema>;

const systemInstruction = `
You are a quiz generation assistant. Your task is to generate multiple-choice questions based on a given dataset provided in text format.
In addition to the dataset, you may also receive a list of previously generated questions. You must not regenerate any question that already exists in that list. The output should include only newly generated questions that are not duplicates or reworded versions of the existing ones.

Requirements:
All questions and answer choices must be written in the same language as the dataset.
Each question must have exactly 4 answer options, labeled with a "text" and a "correct" boolean field.
Each question must have between 1 and 3 correct answers ("correct": true) among the four options.
Provide a concise and informative explanation for each question that justifies the correct answer(s).

Constraints:
Avoiding Duplicates
Compare newly generated questions with the provided list of existing questions.
Do not include any question that matches or is a rephrased duplicate of an existing one.
If avoiding duplicates results in fewer than the required number of questions, fill the remaining slots with different questions covering other facts or concepts from the dataset.

General Rules
Ensure topic and difficulty diversity across the questions.
Avoid duplication of facts, rephrased repetitions, or overlapping ideas.
Before returning the result, double-check that the number of newly generated questions exactly matches the required count for the detected case.
`;

const metadataSchema = z.object({
  title: z.string().max(255).describe("A short descriptive title summarizing the dataset"),
  language: z.string().max(64).describe("The primary language of the dataset in ISO 639 format"),
  ok: z
    .boolean()
    .describe("true if the context is informative enough to generate multiple-choice questions; false if it is not"),
  numberOfQuestions: z.number().describe("Number of questions should be generated from the dataset"),
});

const metadataSchemaJson = z.toJSONSchema(metadataSchema);

const metadataInstruction = `
You are a quiz generation assistant. Your task is to analyze a given dataset in text format and output a JSON object containing metadata for quiz generation.

Language Rule:
- Detect the primary language of the dataset and return it in ISO 639 format (e.g., "en" for English, "vi" for Vietnamese).
- Do not translate, mix, or switch languages.

Content Suitability:
- If the dataset is gibberish, meaningless text, random characters, or otherwise contains no coherent or factual information, set "ok" to false.
- If the dataset contains at least 3 meaningful facts or concepts, set "ok" to true.

Title:
- Provide a short, clear, and descriptive title summarizing the dataset's content.

Question Count Guidance:
- If the dataset is a list of clear question-and-answer pairs (Q&A format), the number of generated questions must match the number of Q&A pairs detected (max 100).
- If the dataset is not in Q&A format, a standard-length article or dataset should generate approximately 10 questions.

Output Rules:
- Output only the JSON object as specified in the schema. Do not include any extra commentary or formatting.
`;

class QuizGenerator {
  public async generateMetadata(context: string) {
    try {
      const response = await ai.models.generateContent({
        model: await remoteConfigs.getLLMModel(),
        contents: [
          {
            role: "user",
            parts: [
              {
                text: context,
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: metadataSchemaJson,
          systemInstruction: metadataInstruction,
          thinkingConfig: {
            thinkingBudget: 512,
          },
        },
      });
      if (!response.text) {
        return null;
      }
      return metadataSchema.parse(JSON.parse(response.text));
    } catch (e) {
      logger.error({ error: e, method: "QuizGenerator.generateMetadata" });
      return null;
    }
  }

  public async generateQuestions(
    context: string,
    numberOfQuestions: number,
    previousQuestions: Response["questions"],
  ): Promise<Response | null> {
    try {
      const response = await ai.models.generateContent({
        model: (await remoteConfigs.getLLMModel()) || "gemini-2.5-flash-lite",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `generate exactly ${numberOfQuestions} questions`,
              },
            ],
          },
          {
            role: "user",
            parts: [
              {
                text: context,
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchemaJson,
          systemInstruction: (await remoteConfigs.getLLMInstruction()) || systemInstruction,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      });
      if (!response.text) {
        return null;
      }
      const result = responseSchema.safeParse(JSON.parse(response.text));
      if (!result.success) {
        logger.error("invalid schema", result.error.message);
        return null;
      }
      result.data?.questions.forEach((question) => {
        // @ts-ignore
        question.id = v4();
        // @ts-ignore
        question.answers?.forEach((answer) => (answer.id = v4()));
      });
      return result.data || null;
    } catch (e) {
      logger.error({ error: e, method: "QuizGenerator.generateQuestions" });
      return null;
    }
  }
}

export const quizGenerator = new QuizGenerator();
