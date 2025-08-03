import { GoogleGenAI } from "@google/genai";
import { type Static, Type } from "@sinclair/typebox";
import { Env } from "../../env.js";

const ai = new GoogleGenAI({ apiKey: Env.GEMINI_API_KEY });

const responseSchema = Type.Object(
  {
    title: Type.String({
      description: "A short descriptive title summarizing the dataset",
      maxLength: 255,
    }),
    questions: Type.Array(
      Type.Object(
        {
          text: Type.String({
            description: "A clear and concise question derived from the dataset.",
          }),
          answers: Type.Array(
            Type.Object(
              {
                text: Type.String({
                  description: "The text of this answer option.",
                }),
                correct: Type.Boolean({
                  description: "If this option is correct",
                }),
              },
              { additionalProperties: false },
            ),
            {
              minItems: 4,
              maxItems: 4,
              description: "Exactly 4 answer options for the question.",
            },
          ),
          explanation: Type.String({
            description: "Explanation of why the answer is correct.",
          }),
        },
        { additionalProperties: false },
      ),
      {
        minItems: 1,
        description: "An array of quiz questions derived from the dataset.",
      },
    ),
  },
  {
    title: "Multiple Choice Questions Dataset",
  },
);

type Response = Static<typeof responseSchema>;

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
        responseSchema,
        systemInstruction,
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    });
    if (response.text) {
      const result = JSON.parse(response.text) as Response;
      result?.questions.forEach((question, qi) => {
        // @ts-ignore
        question.id = String(qi + 1);
        // @ts-ignore
        question.answers?.forEach((answer, ai) => (answer.id = String(ai + 1)));
      });
      return result;
    }
    return null;
  }
}

export const quizGenerator = new QuizGenerator();
