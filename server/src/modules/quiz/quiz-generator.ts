import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { Env } from "../../env.js";
import type { MakeNullish } from "../../types";
import { remoteConfigs } from "../config/remote-configs";

const ai = new GoogleGenAI({ apiKey: Env.GEMINI_API_KEY });

const responseSchema = z
  .object({
    title: z.string().max(1024).describe("A short, clear, and descriptive title summarizing the dataset's content"),
    questions: z
      .array(
        z
          .object({
            text: z.string().max(1024).describe("A clear and concise question derived from the dataset."),
            answers: z
              .array(
                z
                  .object({
                    text: z.string().max(1024).describe("The text of this answer option."),
                    correct: z.boolean().describe("If this option is correct"),
                  })
                  .strict(),
              )
              .min(4)
              .max(4)
              .describe("Exactly 4 answer options for the question."),
            explanation: z.string().max(1024).describe("Explanation of why the answer is correct."),
          })
          .strict(),
      )
      .min(1)
      .describe("An array of quiz questions derived from the dataset."),
  })
  .describe("Multiple Choice Questions Dataset");

const responseSchemaJson = z.toJSONSchema(responseSchema);

export type Questions = MakeNullish<{
  text: string;
  explanation: string;
  answers: MakeNullish<{
    id: string;
    text: string;
    correct: boolean;
  }>[];
}>[];

export type Response = MakeNullish<{
  title: string;
  questions: Questions;
}>;

const systemInstruction = `
You are a quiz-generation assistant.  Your job is to produce a set of multiple-choice questions (MCQs) derived from a text dataset.  Output must be machine-readable JSON that strictly follows the response schema (title + questions).  Do not output any commentary, diagnostics, or anything other than the JSON object that validates against the response schema.

High-level goals
- Create clear, factually grounded MCQs that come only from the input dataset.
- Do NOT invent facts or add information that is not present in the dataset.
- Preserve the dataset's language: detect the dataset's primary language and generate all text in that language (no translation or mixing).

Avoiding duplicates (very important)
- You may receive a list of previously generated questions. Do not regenerate any question that is identical or a rephrased duplicate of an existing question.
- Use semantic/keyword comparison (paraphrase detection) and exact-string matching to detect duplicates. If a newly proposed question would be a paraphrase of any existing question, discard it.
- If duplicate avoidance reduces the available pool, fill remaining slots with distinct questions that cover other facts or concepts present in the dataset.
- If no new valid questions can be produced (e.g., dataset too small or completely covered by existing questions), return a valid JSON object with an appropriate title and an empty "questions" array.

Content suitability & safety
- If the dataset is gibberish, contains fewer than 3 meaningful facts/concepts, or otherwise lacks coherent content, do NOT generate questions — return a valid JSON with a title and an empty "questions" array.
- Do not produce content that is offensive, harmful, or disallowed by policy. If the dataset requests such content, return an empty "questions" array.

Question writing rules
- All questions and answers must be clearly answerable using information present in the dataset.
- Avoid overlap: questions should target different facts, concepts, or reasoning steps (aim for variety of topic and difficulty).
- Keep language concise and unambiguous. Prefer single-sentence questions when possible.
- Explanations must directly reference the dataset fact(s) that justify the correct answer(s); do not hallucinate extra context.
- Maintain consistent formatting: 4 answer choices per question, exactly 1–3 correct answers, explanation for each question.

Quality checks (perform before returning)
- Confirm exactly 4 answers per question and between 1 and 3 "correct: true" flags.
- Confirm no question duplicates any provided existing question (semantic duplicates included).
- Confirm output is valid JSON and conforms to the Zod schema.

Failure & edge behaviors
- If dataset language cannot be determined, default to the language used most frequently in the dataset; if still ambiguous, use English.
- If previously-generated-questions are missing or not provided, generate a full set of valid questions based on the dataset (still adhere to uniqueness among the questions you produce).
- If you cannot create any valid questions, return a JSON object with a short descriptive title and an empty "questions" array.

Examples
- Allowed: questions that are directly supported by dataset facts, short explanations citing dataset facts.
- Disallowed: invented facts, answers that require outside knowledge, paraphrases of provided questions.

IMPORTANT: Output nothing but the final JSON object that matches the response schema. No extra text, no markdown fences, and no commentary.
`;

class QuizGenerator {
  public async generateQuestions(
    context: string,
    numberOfQuestions: number,
    previousQuestions: Response["questions"],
  ): Promise<Response | null> {
    const response = await ai.models.generateContent({
      model: (await remoteConfigs.getLLMModel()) || "gemini-2.5-flash-lite",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `previous questions: ${JSON.stringify(previousQuestions)}`,
            },
          ],
        },
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
    return responseSchema.parse(JSON.parse(response.text || ""));
  }
}

export const quizGenerator = new QuizGenerator();
