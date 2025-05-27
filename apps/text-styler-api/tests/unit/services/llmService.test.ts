import { expect } from 'chai';
import sinon from 'sinon';
import { LlmService } from '../../../src/services/llmService';
import { OpenAIService } from '../../../src/services/openaiService';
import { PromptService } from '../../../src/services/promptService';
import { CacheService } from '../../../src/services/cacheService';
import { OperationalError } from '../../../src/utils/errorHandler';

describe('Unit Tests - LlmService', () => {
  let sandbox: sinon.SinonSandbox;
  let llmService: LlmService;
  let openaiServiceStub: sinon.SinonStubbedInstance<OpenAIService>;
  let promptServiceStub: sinon.SinonStubbedInstance<PromptService>;
  let cacheServiceStub: sinon.SinonStubbedInstance<CacheService>;
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    
    openaiServiceStub = sandbox.createStubInstance(OpenAIService);
    promptServiceStub = sandbox.createStubInstance(PromptService);
    cacheServiceStub = sandbox.createStubInstance(CacheService);
    
    sandbox.stub(console, 'log');
    sandbox.stub(console, 'error');
    
    llmService = new LlmService();
    
    Object.defineProperty(llmService, 'openaiService', { value: openaiServiceStub });
    Object.defineProperty(llmService, 'promptService', { value: promptServiceStub });
    Object.defineProperty(llmService, 'cacheService', { value: cacheServiceStub });
  });
  
  afterEach(() => {
    sandbox.restore();
  });
  
  describe('improveText', () => {
    const originalText = 'This is a test sentance with some gramatical errors.';
    const improvedText = 'This is a test sentence with some grammatical errors.';
    const mockMessages = [{ role: 'system' as const, content: 'You are an editor' }, { role: 'user' as const, content: originalText }];
    
    it('should return empty string for empty input', async () => {
      const result = await llmService.improveText('');
      expect(result).to.equal('');
    });
    
    it('should return cached result if available', async () => {
      cacheServiceStub.get.withArgs(originalText.trim()).returns(improvedText);
      
      const result = await llmService.improveText(originalText);
      
      expect(result).to.equal(improvedText);
      expect(cacheServiceStub.get.calledOnce).to.be.true;
      expect(openaiServiceStub.getChatCompletion.called).to.be.false;
    });
    
    it('should call LLM API if cache misses', async () => {
      cacheServiceStub.get.returns(undefined);
      promptServiceStub.buildGrammarCorrectionPrompt.returns(mockMessages);
      openaiServiceStub.getChatCompletion.resolves(improvedText);
      
      const result = await llmService.improveText(originalText);
      
      expect(result).to.equal(improvedText);
      expect(cacheServiceStub.get.calledOnce).to.be.true;
      expect(promptServiceStub.buildGrammarCorrectionPrompt.calledOnce).to.be.true;
      expect(openaiServiceStub.getChatCompletion.calledOnce).to.be.true;
      expect(cacheServiceStub.set.calledWith(originalText.trim(), improvedText)).to.be.true;
    });
    
    it('should return original text if LLM returns undefined', async () => {
      cacheServiceStub.get.returns(undefined);
      promptServiceStub.buildGrammarCorrectionPrompt.returns(mockMessages);
      openaiServiceStub.getChatCompletion.resolves(undefined);
      
      const result = await llmService.improveText(originalText);
      
      expect(result).to.equal(originalText);
    });
    
    it('should throw OperationalError when API call fails', async () => {
      cacheServiceStub.get.returns(undefined);
      promptServiceStub.buildGrammarCorrectionPrompt.returns(mockMessages);
      openaiServiceStub.getChatCompletion.rejects(new Error('API error'));
      
      try {
        await llmService.improveText(originalText);
        expect.fail('Should have thrown an error');
      } catch (error) {
        if (error instanceof OperationalError) {
          expect(error.message).to.include('Failed to improve text using LLM');
          expect(error.message).to.include('API error');
          expect(error.statusCode).to.equal(500);
        }
      }
    });
  });
});
