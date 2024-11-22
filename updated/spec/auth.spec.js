import { isGuest, isLoggedIn, isSeller } from '../middleware/auth.js';
import Listing from '../models/listing.js';

describe('Auth Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            session: {},
            flash: jasmine.createSpy('flash'),
            params: {}
        };
        res = {
            redirect: jasmine.createSpy('redirect')
        };
        next = jasmine.createSpy('next');
    });

    describe('isGuest', () => {
        it('should call next if user is not logged in', () => {
            isGuest(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should redirect to /listings if user is logged in', () => {
            req.session.user = { _id: 'user-id' };
            isGuest(req, res, next);
            expect(req.flash).toHaveBeenCalledWith('error', 'You are logged in already');
            expect(res.redirect).toHaveBeenCalledWith('/listings');
        });
    });

    describe('isLoggedIn', () => {
        it('should call next if user is logged in', () => {
            req.session.user = { _id: 'user-id' };
            isLoggedIn(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should redirect to /accounts/login if user is not logged in', () => {
            isLoggedIn(req, res, next);
            expect(req.flash).toHaveBeenCalledWith('error', 'You need to log in first!');
            expect(res.redirect).toHaveBeenCalledWith('/accounts/login');
        });
    });

    describe('isSeller', () => {
        it('should call next with an error if user is not logged in', async () => {
            req.params.id = 'listing-id';
            await isSeller(req, res, next);
            const error = next.calls.argsFor(0)[0];
            expect(error).toEqual(jasmine.any(Error));
            expect(error.message).toBe('User is not logged in');
            expect(error.status).toBe(401);
        });

        it('should call next if user is the seller of the listing', async () => {
            req.session.user = { _id: 'user-id' };
            req.params.id = 'listing-id';
            spyOn(Listing, 'findById').and.resolveTo({ seller: { equals: () => true } });
            await isSeller(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should call next with an error if user is not the seller of the listing', async () => {
            req.session.user = { _id: 'user-id' };
            req.params.id = 'listing-id';
            spyOn(Listing, 'findById').and.resolveTo({ seller: { equals: () => false } });
            await isSeller(req, res, next);
            const error = next.calls.argsFor(0)[0];
            expect(error).toEqual(jasmine.any(Error));
            expect(error.message).toBe('Unauthorized to access the resource');
            expect(error.status).toBe(401);
        });
    });
});