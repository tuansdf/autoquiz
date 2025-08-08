import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { Env } from "../../env.js";
import { logger } from "../../utils/logger";
import { remoteConfigs } from "../config/remote-configs";

const ai = new GoogleGenAI({ apiKey: Env.GEMINI_API_KEY });

const responseSchema = z
  .object({
    title: z.string().max(255).describe("A short descriptive title summarizing the dataset"),
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

Requirements:
All questions and answer choices must be written in the same language as the dataset.
Each question must have exactly 4 answer options, labeled with a "text" and a "correct" boolean field.
Each question must have between 1 and 3 correct answers ("correct": true) among the four options.
Provide a concise and informative explanation for each question that justifies the correct answer(s).

Constraints:
1. Too Short or Incomplete Dataset
A dataset is considered “too short” if it contains fewer than 3 meaningful facts or concepts.
In this case, generate exactly 1 question and include in the explanation that the dataset was insufficient for more questions.
2. List of Q&A Pairs Provided
If the dataset is a list of existing Q&A pairs, generate the same number of questions as in the provided context, with a maximum limit of 50 questions.
Example: If the context contains 7 Q&A pairs, generate exactly 7 new questions. If it contains 55, generate 50.
3. Normal Case
If neither special case above applies, generate exactly 20 questions.
4. General Rules
Ensure topic and difficulty diversity across the questions.
Avoid duplication of facts, rephrased repetitions, or overlapping ideas.
Before returning the result, double-check that the number of generated questions exactly matches the required count for the detected case.
Do not include any commentary, formatting guidance, or extra text—only return the raw JSON output.
`;

class QuizGenerator {
  public async generateQuestions(context: string): Promise<Response | null> {
    const response = await ai.models.generateContent({
      model: (await remoteConfigs.getLLMModel()) || "gemini-2.5-flash-lite",
      contents: context,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchemaJson,
        systemInstruction: (await remoteConfigs.getLLMInstruction()) || systemInstruction,
        thinkingConfig: {
          thinkingBudget: 512,
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
    result.data?.questions.forEach((question, qi) => {
      // @ts-ignore
      question.id = String(qi + 1);
      // @ts-ignore
      question.answers?.forEach((answer, ai) => (answer.id = String(ai + 1)));
    });
    return result.data || null;
  }
}

export const quizGenerator = new QuizGenerator();
