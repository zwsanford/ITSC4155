import { expect } from 'chai';
import sinon from 'sinon';
import { validationResult } from 'express-validator';
import { validateResult } from '../middleware/validator.js';

// Mock request, response, and next
const mockReq = (flashSpy) => ({
  flash: flashSpy || sinon.spy(),
});

const mockRes = () => {
  const res = {};
  res.redirect = sinon.spy();
  return res;
};

const mockNext = sinon.spy();

describe('Validator Middleware - validateResult', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should call next() when there are no validation errors', () => {
    // Mock validationResult to simulate no validation errors
    sinon.stub(validationResult, 'call').returns({
      isEmpty: () => true,
      array: () => [],
    });

    const req = mockReq();
    const res = mockRes();
    const next = mockNext;

    validateResult(req, res, next);

    // Assertions
    expect(next.calledOnce).to.be.true;
    expect(res.redirect.called).to.be.false;
    expect(req.flash.called).to.be.false;
  });

  it('should redirect back and flash errors when there are validation errors', () => {
    // Mock validationResult to simulate validation errors
    sinon.stub(validationResult, 'call').returns({
      isEmpty: () => false,
      array: () => [{ msg: 'Validation error' }],
    });

    const flashSpy = sinon.spy();
    const req = mockReq(flashSpy);
    const res = mockRes();
    const next = mockNext;

    validateResult(req, res, next);

    // Assertions
    expect(next.called).to.be.false;
    expect(res.redirect.calledOnceWith('back')).to.be.true;
    expect(flashSpy.calledOnceWith('error', 'Validation error')).to.be.true;
  });
});