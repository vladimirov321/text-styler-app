import { Request, Response, NextFunction } from 'express';
import { LlmService } from '../services/llmService';
import { ImprovedTextResponse } from '../types';

export class TextController {
  private llmService: LlmService;

  constructor() {
    this.llmService = new LlmService();
  }

  public handleImproveText = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const textToImprove = req.query.text as string;

      if (!textToImprove || typeof textToImprove !== 'string' || textToImprove.trim() === '') {
        res.status(400).json({ error: 'Query parameter "text" is required and must be a non-empty string.' });
        return;
      }

      const improvedText = await this.llmService.improveText(textToImprove);

      const response: ImprovedTextResponse = {
        improved_text: improvedText,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
