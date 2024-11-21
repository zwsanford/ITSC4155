import { expect } from 'chai';
import sinon from 'sinon';
import { isGuest, isLoggedIn, isSeller, isNotSeller } from '../middleware/auth.js';
import Listing from '../models/listing.js';

// Mock request, response, and next
const mockReq = (session = {}, params = {}, flashSpy = sinon.spy()) => ({
    session,
    params,
    flash: flashSpy,
});

const mockRes = () => {
    const res = {};
    res.redirect = sinon.spy();
    return res;
};

const mockNext = sinon.spy();

describe('Auth Middleware', () => {
    afterEach(() => {
        sinon.restore(); // Reset stubs and spies
    });

    describe('isGuest', () => {
        it('should allow the request if user is not logged in', () => {
            const req = mockReq({ user: null });
            const res = mockRes();
            const next = mockNext;

            isGuest(req, res, next);

            expect(next.calledOnce).to.be.true; // Ensure next() is called
            expect(res.redirect.called).to.be.false; // Ensure no redirect occurred
        });

        it('should redirect if user is logged in', () => {
            const req = mockReq({ user: { id: 'test-user' } });
            const res = mockRes();
            const next = mockNext;

            isGuest(req, res, next);

            expect(req.flash.calledOnceWith('error', 'You are logged in already')).to.be.true; // Ensure error message flashed
            expect(res.redirect.calledOnceWith('/listings')).to.be.true; // Ensure redirect occurred
            expect(next.called).to.be.false; // Ensure next() is not called
        });
    });

    describe('isLoggedIn', () => {
        it('should allow the request if user is logged in', () => {
            const req = mockReq({ user: { id: 'test-user' } });
            const res = mockRes();
            const next = mockNext;

            isLoggedIn(req, res, next);

            expect(next.calledOnce).to.be.true; // Ensure next() is called
            expect(res.redirect.called).to.be.false; // Ensure no redirect occurred
        });

        it('should redirect if user is not logged in', () => {
            const req = mockReq({ user: null });
            const res = mockRes();
            const next = mockNext;

            isLoggedIn(req, res, next);

            expect(req.flash.calledOnceWith('error', 'You need to log in first!')).to.be.true; // Ensure error message flashed
            expect(res.redirect.calledOnceWith('/accounts/login')).to.be.true; // Ensure redirect occurred
            expect(next.called).to.be.false; // Ensure next() is not called
        });
    });

    describe('isSeller', () => {
        it('should allow the request if user is the seller of the listing', async () => {
            const req = mockReq({ account: 'seller-id' }, { id: 'listing-id' });
            const res = mockRes();
            const next = mockNext;

            sinon.stub(Listing, 'findById').resolves({ seller: 'seller-id' });

            await isSeller(req, res, next);

            expect(next.calledOnce).to.be.true; // Ensure next() is called
            expect(res.redirect.called).to.be.false; // Ensure no redirect occurred
        });

        it('should return 401 if user is not the seller', async () => {
            const req = mockReq({ account: 'different-id' }, { id: 'listing-id' });
            const res = mockRes();
            const next = mockNext;

            sinon.stub(Listing, 'findById').resolves({ seller: 'seller-id' });

            await isSeller(req, res, next);

            const error = next.firstCall.args[0];
            expect(error).to.be.an('error');
            expect(error.message).to.equal('Unauthorized to access the resource');
            expect(error.status).to.equal(401);
        });

        it('should call next with an error if listing is not found', async () => {
            const req = mockReq({}, { id: 'listing-id' });
            const res = mockRes();
            const next = mockNext;

            sinon.stub(Listing, 'findById').resolves(null);

            await isSeller(req, res, next);

            const error = next.firstCall.args[0];
            expect(error).to.be.an('error');
        });
    });

    describe('isNotSeller', () => {
        it('should allow the request if user is not the seller of the listing', async () => {
            const req = mockReq({ account: 'different-id' }, { id: 'listing-id' });
            const res = mockRes();
            const next = mockNext;

            sinon.stub(Listing, 'findById').resolves({ seller: 'seller-id' });

            await isNotSeller(req, res, next);

            expect(next.calledOnce).to.be.true; // Ensure next() is called
            expect(res.redirect.called).to.be.false; // Ensure no redirect occurred
        });

        it('should return 401 if user is the seller', async () => {
            const req = mockReq({ account: 'seller-id' }, { id: 'listing-id' });
            const res = mockRes();
            const next = mockNext;

            sinon.stub(Listing, 'findById').resolves({ seller: 'seller-id' });

            await isNotSeller(req, res, next);

            const error = next.firstCall.args[0];
            expect(error).to.be.an('error');
            expect(error.message).to.equal('Unauthorized to access the resource');
            expect(error.status).to.equal(401);
        });

        it('should call next with an error if listing is not found', async () => {
            const req = mockReq({}, { id: 'listing-id' });
            const res = mockRes();
            const next = mockNext;

            sinon.stub(Listing, 'findById').resolves(null);

            await isNotSeller(req, res, next);

            const error = next.firstCall.args[0];
            expect(error).to.be.an('error');
        });
    });
});