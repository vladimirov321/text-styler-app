import { expect } from 'chai';
import { PromptService } from '../../../src/services/promptService';

describe('Unit Tests - PromptService', () => {
  let promptService: PromptService;
  
  beforeEach(() => {
    promptService = new PromptService();
  });
  
  describe('buildGrammarCorrectionPrompt', () => {
    it('should return a valid array of messages with system and user roles', () => {
      const text = 'This is a test sentance with some gramatical errors.';
      
      const result = promptService.buildGrammarCorrectionPrompt(text);
      
      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(2);
      
      expect(result[0]).to.have.property('role', 'system');
      expect(result[0]).to.have.property('content').that.includes('expert editor');
      
      expect(result[1]).to.have.property('role', 'user');
      expect(result[1]).to.have.property('content', text);
    });
    
    it('should handle empty input text', () => {
      const text = '';
      
      const result = promptService.buildGrammarCorrectionPrompt(text);
      
      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(2);
      expect(result[1]).to.have.property('content', '');
    });
    
    it('should handle special characters in input text', () => {
      const text = 'Text with special chars: !@#$%^&*()_+{}|:"<>?[]\\;\',./';
      
      const result = promptService.buildGrammarCorrectionPrompt(text);
      
      expect(result[1]).to.have.property('content', text);
    });
  });
});
