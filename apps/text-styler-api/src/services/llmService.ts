import { OpenAIService } from './openaiService';
import { PromptService } from './promptService';
import { CacheService } from './cacheService';
import { llmConfig } from '../config/llmConfig';
import { OperationalError } from '../utils/errorHandler';

export class LlmService {
  private openaiService: OpenAIService;
  private promptService: PromptService;
  private cacheService: CacheService;

  constructor() {
    this.openaiService = new OpenAIService();
    this.promptService = new PromptService();
    this.cacheService = new CacheService(llmConfig.cacheOptions);
    
    console.log('LlmService initialized.');
  }

  public async improveText(originalText: string): Promise<string> {
    if (!originalText || originalText.trim() === '') {
      return "";
    }

    console.log(`[LlmService] Received text to improve: "${originalText}"`);
    
    const cacheKey = originalText.trim();
    
    const cachedResult = this.cacheService.get<string>(cacheKey);
    if (cachedResult) {
      console.log(`[LlmService] Cache hit for text: "${originalText}"`);
      return cachedResult;
    }
    
    console.log(`[LlmService] Cache miss, calling LLM API`);
    
    try {
      const messages = this.promptService.buildGrammarCorrectionPrompt(originalText);
      const improved = await this.openaiService.getChatCompletion({
        model: llmConfig.models.textImprovement,
        messages,
        temperature: llmConfig.defaultTemperature,
      }) || originalText;

      console.log(`[LlmService] Returning improved text: "${improved}"`);
      
      this.cacheService.set(cacheKey, improved);
      
      return improved;
    } catch (error: any) {
      console.error("Error calling OpenAI API:", error);
      
      if (error.response) {
        console.error("OpenAI API response error:", error.response.data);
      }
      throw new OperationalError("Failed to improve text using LLM. " + (error.message || ''), 500);
    }
  }
}
