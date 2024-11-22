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

    describe('isGuest', () => {
        it('should allow the request if user is not logged in', () => {
            const req = mockReq({ user: null });
            const res = mockRes();

            isGuest(req, res, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(res.redirect).not.toHaveBeenCalled();
        });

        it('should redirect if user is logged in', () => {
            const req = mockReq({ user: { id: 'test-user' } });
            const res = mockRes();

            isGuest(req, res, mockNext);

            expect(req.flash).toHaveBeenCalledWith('error', 'You are logged in already');
            expect(res.redirect).toHaveBeenCalledWith('/listings');
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('isLoggedIn', () => {
        it('should allow the request if user is logged in', () => {
            const req = mockReq({ user: { id: 'test-user' } });
            const res = mockRes();

            isLoggedIn(req, res, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(res.redirect).not.toHaveBeenCalled();
        });

        it('should redirect if user is not logged in', () => {
            const req = mockReq({ user: null });
            const res = mockRes();

            isLoggedIn(req, res, mockNext);

            expect(req.flash).toHaveBeenCalledWith('error', 'You need to log in first!');
            expect(res.redirect).toHaveBeenCalledWith('/accounts/login');
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('isSeller', () => {
        it('should allow the request if user is the seller of the listing', async () => {
            const req = mockReq({ account: 'seller-id' }, { id: 'listing-id' });
            const res = mockRes();

            spyOn(Listing, 'findById').and.resolveTo({ seller: 'seller-id' });

            await isSeller(req, res, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(res.redirect).not.toHaveBeenCalled();
        });

        it('should return 401 if user is not the seller', async () => {
            const req = mockReq({ account: 'different-id' }, { id: 'listing-id' });
            const res = mockRes();

            spyOn(Listing, 'findById').and.resolveTo({ seller: 'seller-id' });

            await isSeller(req, res, mockNext);

            const error = mockNext.calls.argsFor(0)[0];
            expect(error).toEqual(jasmine.any(Error));
            expect(error.message).toBe('Unauthorized to access the resource');
            expect(error.status).toBe(401);
        });

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
    });

    describe('isNotSeller', () => {
        it('should allow the request if user is not the seller of the listing', async () => {
            const req = mockReq({ account: 'different-id' }, { id: 'listing-id' });
            const res = mockRes();

            spyOn(Listing, 'findById').and.resolveTo({ seller: 'seller-id' });

            await isNotSeller(req, res, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(res.redirect).not.toHaveBeenCalled();
        });

        it('should return 401 if user is the seller', async () => {
            const req = mockReq({ account: 'seller-id' }, { id: 'listing-id' });
            const res = mockRes();

            spyOn(Listing, 'findById').and.resolveTo({ seller: 'seller-id' });

            await isNotSeller(req, res, mockNext);

            const error = mockNext.calls.argsFor(0)[0];
            expect(error).toEqual(jasmine.any(Error));
            expect(error.message).toBe('Unauthorized to access the resource');
            expect(error.status).toBe(401);
        });

        it('should call next with an error if listing is not found', async () => {
            const req = mockReq({}, { id: 'listing-id' });
            const res = mockRes();
        
            spyOn(Listing, 'findById').and.resolveTo(null); // Simulate no listing found
        
            await isNotSeller(req, res, mockNext);
        
            const error = mockNext.calls.argsFor(0)[0];
            expect(error).toEqual(jasmine.any(Error));
            expect(error.message).toBe('Listing not found');
            expect(error.status).toBe(404);
        });        
    });
});