import { isGuest, isLoggedIn, isSeller, isNotSeller } from '../middleware/auth.js';
import Listing from '../models/listing.js';

describe('Auth Middleware', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = (session = {}, params = {}, flashSpy = jasmine.createSpy('flash')) => ({
            session,
            params,
            flash: flashSpy,
        });

        mockRes = () => {
            const res = {};
            res.redirect = jasmine.createSpy('redirect');
            return res;
        };

        mockNext = jasmine.createSpy('next');
    });

    afterEach(() => {
        if (Listing.findById && Listing.findById.calls) {
            Listing.findById.calls.reset();
        }
    });

    describe('isLoggedIn', () => {
        it('should redirect if user is not logged in', () => {
            const req = mockReq();
            const res = mockRes();

            isLoggedIn(req, res, mockNext);

            expect(res.redirect).toHaveBeenCalledWith('/users/login');
        });
    });

    describe('isSeller', () => {
        it('should call next with an error if listing is not found', async () => {
            const req = mockReq({}, { id: 'listing-id' });
            const res = mockRes();

            spyOn(Listing, 'findById').and.resolveTo(null); // Simulate no listing found

            await isSeller(req, res, mockNext);

            const error = mockNext.calls.argsFor(0)[0];
            expect(error).toEqual(jasmine.any(Error));
            expect(error.message).toBe('Listing not found');
            expect(error.status).toBe(404);
        });

        it('should return 401 if user is the seller', async () => {
            const req = mockReq({ user: { id: 'seller-id' } }, { id: 'listing-id' });
            const res = mockRes();

            spyOn(Listing, 'findById').and.resolveTo({ seller: 'seller-id' });

            await isSeller(req, res, mockNext);

            const error = mockNext.calls.argsFor(0)[0];
            expect(error).toEqual(jasmine.any(Error));
            expect(error.message).toBe('Unauthorized to access the resource');
            expect(error.status).toBe(401);
        });

        it('should return 401 if user is not the seller', async () => {
            const req = mockReq({ user: { id: 'not-seller-id' } }, { id: 'listing-id' });
            const res = mockRes();

            spyOn(Listing, 'findById').and.resolveTo({ seller: 'seller-id' });

            await isSeller(req, res, mockNext);

            const error = mockNext.calls.argsFor(0)[0];
            expect(error).toEqual(jasmine.any(Error));
            expect(error.message).toBe('Unauthorized to access the resource');
            expect(error.status).toBe(401);
        });
    });

    describe('isNotSeller', () => {
        it('should call next with an error if listing is not found', async () => {
            const req = mockReq({}, { id: 'listing-id' });
            const res = mockRes();

            spyOn(Listing, 'findById').and.resolveTo(null);

            await isNotSeller(req, res, mockNext);

            const error = mockNext.calls.argsFor(0)[0];
            expect(error).toEqual(jasmine.any(Error));
            expect(error.message).toBe('Listing not found');
            expect(error.status).toBe(404);
        });
    });
});