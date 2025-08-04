import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { Env } from "../../env.js";
import { logger } from "../../utils/logger";

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
- The questions must be **factual or conceptually grounded** in the dataset.
- All questions and answer choices must be written in the **same language as the dataset**.
- Each question must have **exactly 4 answer options**, labeled with a "text" and a "correct" boolean field.
- Each question must have **between 1 and 3 correct answers** (correct: true) among the four options.
- Provide a concise and informative **explanation** for each question that justifies the correct answer(s).

Constraints:
- Generate **exactly 20 questions**.
- Ensure **topic and difficulty diversity** across the questions.
- Avoid duplication of facts, rephrased repetitions, or overlapping ideas.
- Do **not** include any commentary, formatting guidance, or extra text—only return the raw JSON output.
`;

class QuizGenerator {
  public async generateQuestions(context: string): Promise<Response | null> {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: context,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchemaJson,
        systemInstruction,
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
