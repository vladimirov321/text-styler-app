import { expect } from 'chai';
import sinon from 'sinon';
import { Request, Response } from 'express';
import { TextController } from '../../../src/controllers/textController';
import { LlmService } from '../../../src/services/llmService';
import { OperationalError } from '../../../src/utils/errorHandler';

describe('Unit Tests - TextController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonSpy;
  let llmServiceStub: sinon.SinonStubbedInstance<LlmService>;
  let sandbox: sinon.SinonSandbox;
  let textController: TextController;
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(console, 'log');
    sandbox.stub(console, 'error');
    
    req = {
      query: {}
    };
    
    res = {
      status: sandbox.stub().returnsThis(),
      json: sandbox.stub().returnsThis()
    };
    
    next = sandbox.spy();
    
    llmServiceStub = sandbox.createStubInstance(LlmService);
    
    textController = new TextController();
    
    // @ts-ignore - Replacing private instance for testing
    textController.llmService = llmServiceStub;
  });
  
  afterEach(() => {
    sandbox.restore();
  });
  
  describe('handleImproveText', () => {
    it('should return an error when text query parameter is missing', async () => {
      await textController.handleImproveText(req as Request, res as Response, next);
      
      expect(next.calledOnce).to.be.true;
      const error = next.firstCall.args[0];
      expect(error).to.be.instanceOf(OperationalError);
      expect(error.message).to.include('Query parameter "text" is required');
      expect(error.statusCode).to.equal(400);
    });
    
    it('should return an error when text query parameter is empty', async () => {
      req.query = { text: '' };
      
      await textController.handleImproveText(req as Request, res as Response, next);
      
      expect(next.calledOnce).to.be.true;
      const error = next.firstCall.args[0];
      expect(error).to.be.instanceOf(OperationalError);
      expect(error.message).to.include('Query parameter "text" is required');
      expect(error.statusCode).to.equal(400);
    });
    
    it('should return improved text when text query parameter is valid', async () => {
      const originalText = 'This is a test sentance with some gramatical errors.';
      const improvedText = 'This is a test sentence with some grammatical errors.';
      
      req.query = { text: originalText };
      
      llmServiceStub.improveText.resolves(improvedText);
      
      await textController.handleImproveText(req as Request, res as Response, next);
      
      expect(llmServiceStub.improveText.calledOnceWith(originalText)).to.be.true;
      sinon.assert.calledWith(res.status as sinon.SinonStub, 200);
      sinon.assert.calledWith(res.json as sinon.SinonStub, {
        improved_text: improvedText
      });
      expect(next.called).to.be.false;
    });
    
    it('should pass errors from LlmService to the next middleware', async () => {
      const originalText = 'This is a test.';
      req.query = { text: originalText };
      
      const error = new OperationalError('Test error', 500);
      llmServiceStub.improveText.rejects(error);
      
      await textController.handleImproveText(req as Request, res as Response, next);
      
      expect(llmServiceStub.improveText.calledOnceWith(originalText)).to.be.true;
      expect(next.calledOnceWith(error)).to.be.true;
      sinon.assert.notCalled(res.status as sinon.SinonStub);
      sinon.assert.notCalled(res.json as sinon.SinonStub);
    });
  });
});
