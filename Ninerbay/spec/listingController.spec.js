import { create } from '../controllers/listingController.js';
import Listing from '../models/listing.js';

describe('Listing Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            session: {},
            body: {}
        };
        res = {
            redirect: jasmine.createSpy('redirect')
        };
        next = jasmine.createSpy('next');
    });

    describe('create', () => {
        it('should return 401 if user is not logged in', async () => {
            await create(req, res, next);
            const error = next.calls.argsFor(0)[0];
            expect(error).toEqual(jasmine.any(Error));
            expect(error.message).toBe('User is not logged in');
            expect(error.status).toBe(401);
        });

        it('should return 400 if image is not provided', async () => {
            req.session.user = { _id: 'user-id' };
            req.body = { title: 'Test Title', description: 'Test Description' };
            await create(req, res, next);
            const error = next.calls.argsFor(0)[0];
            expect(error).toEqual(jasmine.any(Error));
            expect(error.message).toBe('Image is required');
            expect(error.status).toBe(400);
        });

        it('should save the listing and redirect to /listings', async () => {
            req.session.user = { _id: 'user-id' };
            req.body = { title: 'Test Title', description: 'Test Description', image: 'test-image.jpg' };
            spyOn(Listing.prototype, 'save').and.resolveTo();
            await create(req, res, next);
            expect(Listing.prototype.save).toHaveBeenCalled();
            expect(res.redirect).toHaveBeenCalledWith('/listings');
        });

        it('should handle validation errors', async () => {
            req.session.user = { _id: 'user-id' };
            req.body = { title: 'Test Title', description: 'Test Description', image: 'test-image.jpg' };
            const validationError = new Error('Validation Error');
            validationError.name = 'ValidationError';
            spyOn(Listing.prototype, 'save').and.rejectWith(validationError);
            await create(req, res, next);
            const error = next.calls.argsFor(0)[0];
            expect(error).toEqual(validationError);
            expect(error.status).toBe(400);
        });

        it('should handle other errors', async () => {
            req.session.user = { _id: 'user-id' };
            req.body = { title: 'Test Title', description: 'Test Description', image: 'test-image.jpg' };
            const otherError = new Error('Other Error');
            spyOn(Listing.prototype, 'save').and.rejectWith(otherError);
            await create(req, res, next);
            const error = next.calls.argsFor(0)[0];
            expect(error).toEqual(otherError);
            expect(error.status).toBeUndefined();
        });
    });
});