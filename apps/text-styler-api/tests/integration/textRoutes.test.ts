import { expect } from 'chai';
import request from 'supertest';
import express from 'express';
import sinon from 'sinon';
import { OperationalError } from '../../src/utils/errorHandler';
import { LlmService } from '../../src/services/llmService';
import textRoutes from '../../src/routes/textRoutes';
import { globalErrorHandler } from '../../src/utils/errorHandler';

describe('Integration Tests - Text Routes', () => {
  let app: express.Application;
  let sandbox: sinon.SinonSandbox;
  let llmServiceImproveTextStub: sinon.SinonStub;

  const mockImproveTextFunction = async (text: string): Promise<string> => {
    if (text === 'error_case') {
      throw new OperationalError('Mocked LLM Service Error from Test', 500);
    }
    if (!text || text.trim() === '') {
      return "";
    }
    let improved = text;
    if (text.includes('sentance')) improved = improved.replace('sentance', 'sentence');
    if (text.includes('gramatical')) improved = improved.replace('gramatical', 'grammatical');

    return improved;
  };

  before(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(console, 'log');
    sandbox.stub(console, 'error');

    llmServiceImproveTextStub = sandbox.stub(LlmService.prototype, 'improveText')
      .callsFake(mockImproveTextFunction);

    app = express();
    app.use(express.json());

    app.use('/api/text', textRoutes);

    app.use(globalErrorHandler);
  });

  after(() => {
    sandbox.restore();
  });

  it('should return 400 if text parameter is missing', async function() {
    const response = await request(app)
      .get('/api/text/improve-text')
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).to.have.property('status', 'error');
    expect(response.body.message).to.include('Query parameter "text" is required');
    expect(llmServiceImproveTextStub.called).to.be.false;
  });

  it('should return 400 if text parameter is empty', async function() {
    const response = await request(app)
      .get('/api/text/improve-text?text=')
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).to.have.property('status', 'error');
    expect(response.body.message).to.include('Query parameter "text" is required');
    expect(llmServiceImproveTextStub.called).to.be.false;
  });

  it('should return improved text when text parameter is valid', async function() {
    const originalText = 'This is a test sentance with some gramatical errors.';

    const response = await request(app)
      .get(`/api/text/improve-text?text=${encodeURIComponent(originalText)}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).to.have.property('improved_text');
    expect(response.body.improved_text).to.include('sentence');
    expect(response.body.improved_text).to.include('grammatical');
    expect(response.body.improved_text).to.not.include('sentance');

    expect(llmServiceImproveTextStub.calledOnceWith(originalText)).to.be.true;
  });

  it('should handle errors gracefully when service throws an error', async function() {
    llmServiceImproveTextStub.resetHistory();
    
    const response = await request(app)
      .get('/api/text/improve-text?text=error_case')
      .expect('Content-Type', /json/);

    expect(response.status).to.equal(500);
    expect(response.body).to.have.property('status', 'error');
    expect(response.body).to.have.property('message').that.includes('Mocked LLM Service Error from Test');

    expect(llmServiceImproveTextStub.calledOnce).to.be.true;
    expect(llmServiceImproveTextStub.calledWith('error_case')).to.be.true;
  });
});