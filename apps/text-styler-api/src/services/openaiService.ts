import { OpenAI } from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import dotenv from 'dotenv';

dotenv.config();

export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("FATAL ERROR: OPENAI_API_KEY is not defined in .env file.");
      throw new Error("OpenAI API key is not configured.");
    }
    this.openai = new OpenAI({ apiKey });
    console.log('OpenAIService initialized with OpenAI client.');
  }

  public async getChatCompletion({
    model,
    messages,
    temperature,
  }: {
    model: string;
    messages: ChatCompletionMessageParam[];
    temperature: number;
  }): Promise<string | undefined> {
    const completion = await this.openai.chat.completions.create({
      model,
      messages,
      temperature,
    });
    return completion.choices[0]?.message?.content?.trim();
  }
}
