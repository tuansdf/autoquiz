import { GoogleGenAI } from "@google/genai";
import { Env } from "../../env.js";

const ai = new GoogleGenAI({ apiKey: Env.GEMINI_API_KEY });

const responseSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "Multiple Choice Questions Dataset",
  type: "array",
  items: {
    type: "object",
    properties: {
      question: {
        type: "string",
        description: "The text of the question.",
      },
      answers: {
        type: "array",
        minItems: 4,
        maxItems: 4,
        items: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              enum: [1, 2, 3, 4],
              description: "The identifier for the answer option (1 through 4).",
            },
            text: {
              type: "string",
              description: "The text of the answer choice.",
            },
          },
          required: ["id", "text"],
        },
      },
      correctAnswers: {
        type: "array",
        minItems: 1,
        maxItems: 3,
        items: {
          type: "integer",
          enum: [1, 2, 3, 4],
          description: "The id of the correct answer.",
        },
        description: "An array containing only the correct answer ids.",
      },
      explanation: {
        type: "string",
        description: "Explanation of why the answer is correct.",
      },
    },
    required: ["question", "answers", "correctAnswers", "explanation"],
  },
};

const systemInstruction = `
You are a quiz generation assistant. Your task is to generate multiple choice questions from a given dataset in text format. Each question must help readers review factual or conceptual knowledge clearly stated or implied in the dataset.

Example of one element in the array:

{
  "question": "The question text",
  "answers": [
    { "id": 1, "text": "Option A" },
    { "id": 2, "text": "Option B" },
    { "id": 3, "text": "Option C" },
    { "id": 4, "text": "Option D" }
  ],
  "correctAnswers": [2],
  "explanation": "An explanation of why this answer is correct"
}

Constraints:
- Each question must be based on facts or ideas from the dataset.
- There must be exactly 4 answer choices per question.
- Up to 3 correct answers is allowed per question.
- Each answers object must use an id of 1 through 4.
- The correctAnswers field must be an array containing these ids.
- Every question must include an informative explanation.

Make sure the questions vary in topic and difficulty, and avoid repeating the same fact across multiple questions.

Do not include any commentary or preamble — only the raw JSON output.

Your final output should be a single JSON array containing all 20 questions.
`;

class QuizGenerator {
  public async generateQuestions(context: string): Promise<string | null> {
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
      return JSON.stringify(JSON.parse(response.text));
    }
    return null;
  }
}

export const quizGenerator = new QuizGenerator();
