import OpenAI from "openai";

export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Brak OPENAI_API_KEY w pliku .env");
  }
  return new OpenAI({ apiKey });
}

export function getOpenAIModel(): string {
  return process.env.OPENAI_MODEL ?? "gpt-4o-mini";
}

export function wrapOpenAIError(error: unknown): never {
  if (error instanceof OpenAI.APIError) {
    if (error.status === 429) {
      throw new Error(
        "Brak środków na koncie OpenAI — doładuj billing na platform.openai.com",
      );
    }
    if (error.status === 401) {
      throw new Error("Nieprawidłowy OPENAI_API_KEY w pliku .env");
    }
  }
  throw error;
}
