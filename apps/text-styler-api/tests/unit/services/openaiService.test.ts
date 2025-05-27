import { expect } from 'chai';
import sinon from 'sinon';
import dotenv from 'dotenv';
import { OpenAIService } from '../../../src/services/openaiService';
import { OperationalError } from '../../../src/utils/errorHandler';

describe('Unit Tests - OpenAIService', () => {
  let sandbox: sinon.SinonSandbox;
  let dotenvConfigStub: sinon.SinonStub;
  let consoleLogStub: sinon.SinonStub;
  let consoleErrorStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    dotenvConfigStub = sandbox.stub(dotenv, 'config');
    consoleLogStub = sandbox.stub(console, 'log');
    consoleErrorStub = sandbox.stub(console, 'error');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('constructor', () => {
    it('should initialize successfully if API key is present in process.env', () => {
      delete process.env.OPENAI_API_KEY;
      process.env.OPENAI_API_KEY = 'valid-test-key';

      const service = new OpenAIService();
      expect(service).to.be.instanceOf(OpenAIService);
      expect(consoleErrorStub.called).to.be.false;
    });

    it('should throw an OperationalError if API key is missing', () => {
      dotenvConfigStub.returns({ parsed: {} });
      delete process.env.OPENAI_API_KEY;
      
      try {
        new OpenAIService();
        expect.fail('Expected constructor to throw');
      } catch (error: unknown) {
        if (error instanceof OperationalError) {
          expect(error.message).to.equal('OpenAI API key is not configured.');
          expect(error.statusCode).to.equal(500);
        } else {
          expect.fail('Expected error to be an instance of OperationalError');
        }
        expect(consoleErrorStub.calledWith("FATAL ERROR: OPENAI_API_KEY is not defined in .env file.")).to.be.true;
      }
    });
  });

  describe('getChatCompletion', () => {
    let openaiService: OpenAIService;

    beforeEach(() => {
      process.env.OPENAI_API_KEY = 'valid-key-for-service-instance';
      openaiService = new OpenAIService();
    });

    it('should call the OpenAI API with the correct parameters', async () => {
      const mockCreate = sinon.stub().resolves({
        choices: [{ message: { content: 'Test response' } }],
      });

      const mockOpenAIClientInstance = {
        chat: {
          completions: {
            create: mockCreate,
          },
        },
      };

      // @ts-ignore - Accessing private property for robust mocking
      openaiService.openai = mockOpenAIClientInstance as any;

      const result = await openaiService.getChatCompletion({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Test message' }],
        temperature: 0.7,
      });

      expect(result).to.equal('Test response');
      expect(mockCreate.calledOnce).to.be.true;

      const callArgs = mockCreate.firstCall.args[0];
      expect(callArgs.model).to.equal('gpt-4');
      expect(callArgs.messages[0].content).to.equal('Test message');
      expect(callArgs.temperature).to.equal(0.7);
    });

    it('should re-throw an error if the OpenAI API call fails', async () => {
        const apiError = new Error("Network Error from OpenAI");
        const mockCreate = sinon.stub().rejects(apiError);
        const mockOpenAIClientInstance = {
            chat: { completions: { create: mockCreate } }
        };
        Object.defineProperty(openaiService, 'openai', { value: mockOpenAIClientInstance });

        try {
            await openaiService.getChatCompletion({
                model: 'gpt-4',
                messages: [{ role: 'user' as const, content: 'Test message' }],
                temperature: 0.7
            });
            expect.fail("Expected getChatCompletion to throw an error");
        } catch (error: unknown) {
            expect(error).to.equal(apiError);
        }
    });
  });
});
