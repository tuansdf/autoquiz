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
          question: Type.String({
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

Each question should:
- Be fact-based or conceptually grounded in the dataset.
- Be written in the **same language as the input context**.
- Have **exactly 4 answer options**.
- Include **1 to 3 correct answers**, represented by their respective IDs.
- Provide a **clear explanation** justifying the correct answer(s).
- Be free of ambiguity, repetition, or grammatical errors.

Constraints:
- All questions must be diverse in topic and difficulty.
- Avoid reusing the same fact or concept in multiple questions.
- Do not include commentary, instructions, or explanations outside the JSON output.

Return **exactly 20 questions** in this format.
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
