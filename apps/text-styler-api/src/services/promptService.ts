import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export class PromptService {
  public buildGrammarCorrectionPrompt(text: string): ChatCompletionMessageParam[] {
    return [
      {
        role: "system",
        content:
          "You are an expert editor. Correct the grammar and improve the style of the following text. Return only the corrected text, without any preambles or explanations.",
      },
      { role: "user", content: text },
    ];
  }
}
