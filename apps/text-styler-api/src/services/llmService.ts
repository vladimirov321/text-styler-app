import { OpenAI } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

export class LlmService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("FATAL ERROR: OPENAI_API_KEY is not defined in .env file.");
      throw new Error("OpenAI API key is not configured.");
    }
    this.openai = new OpenAI({ apiKey });
    console.log('LlmService initialized with OpenAI client.');
  }

  private buildGrammarCorrectionPrompt(text: string) {
    return [
      {
        role: "system" as const,
        content:
          "You are an expert editor. Correct the grammar and improve the style of the following text. Return only the corrected text, without any preambles or explanations.",
      },
      { role: "user" as const, content: text },
    ];
  }

  private async getChatCompletion({ model, messages, temperature }: { model: string; messages: any[]; temperature: number; }): Promise<string | undefined> {
    const completion = await this.openai.chat.completions.create({
      model,
      messages,
      temperature,
    });
    return completion.choices[0]?.message?.content?.trim();
  }

  public async improveText(originalText: string): Promise<string> {
    if (!originalText || originalText.trim() === '') {
      return "";
    }

    console.log(`[LlmService] Received text to improve: "${originalText}"`);
    try {
      const messages = this.buildGrammarCorrectionPrompt(originalText);
      const improved =
        (await this.getChatCompletion({
          model: "gpt-4.1-nano",
          messages,
          temperature: 0.7,
        })) || originalText;

      console.log(`[LlmService] Returning improved text: "${improved}"`);

      return improved;
    } catch (error: any) {
      console.error("Error calling OpenAI API:", error);
      
      if (error.response) {
        console.error("OpenAI API response error:", error.response.data);
      }
      throw new Error("Failed to improve text using LLM. " + (error.message || ''));
    }
  }
}
