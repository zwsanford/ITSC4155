import * as listingController from '../controllers/listingController.js';
import Listing from '../models/listing.js';
import { getFileUrl, deleteFile } from '../middleware/fileUpload.js';

describe('Listing Controller', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
            params: {},
            body: {},
            query: {},
            file: null,
            flash: jasmine.createSpy('flash'),
        };
        mockRes = {
            render: jasmine.createSpy('render'),
            redirect: jasmine.createSpy('redirect'),
        };
        mockNext = jasmine.createSpy('next');
    });

    describe('newListing', () => {
        it('should render the new listing form', () => {
            listingController.newListing(mockReq, mockRes);
            expect(mockRes.render).toHaveBeenCalledWith('listing/new');
        });
    });

    describe('create', () => {
        it('should create a new listing and redirect', async () => {
            spyOn(Listing.prototype, 'save').and.returnValue(Promise.resolve());
            mockReq.file = { s3Key: 'test-key', mimetype: 'image/png', size: 1024 };
            mockReq.body = { title: 'Test Listing', price: 100 };

            await listingController.create(mockReq, mockRes, mockNext);

            expect(Listing.prototype.save).toHaveBeenCalled();
            expect(mockRes.redirect).toHaveBeenCalledWith('/listings');
        });

        it('should return an error if no image is provided', async () => {
            await listingController.create(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(jasmine.objectContaining({ status: 400 }));
        });

        it('should handle validation errors', async () => {
            spyOn(Listing.prototype, 'save').and.returnValue(Promise.reject({ name: 'ValidationError' }));

            mockReq.file = { s3Key: 'test-key', mimetype: 'image/png', size: 1024 };
            mockReq.body = { title: 'Test Listing', price: 100 };

            await listingController.create(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(jasmine.objectContaining({ status: 400 }));
        });
    });

    describe('show', () => {
        it('should fetch and render a listing', async () => {
            const listing = { title: 'Test Listing', price: 100, image: { s3Key: 'test-key' } };
            spyOn(Listing, 'findById').and.returnValue(Promise.resolve(listing));
            spyOn(getFileUrl, 'call').and.returnValue(Promise.resolve('signed-url'));

            mockReq.params.id = '60d21b4667d0d8992e610c85';

            await listingController.show(mockReq, mockRes, mockNext);

            expect(Listing.findById).toHaveBeenCalledWith('60d21b4667d0d8992e610c85');
            expect(mockRes.render).toHaveBeenCalledWith('listing/item', { listing });
        });

        it('should handle invalid IDs', async () => {
            mockReq.params.id = 'invalid-id';

            await listingController.show(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(jasmine.objectContaining({ status: 400 }));
        });

        it('should handle listing not found', async () => {
            spyOn(Listing, 'findById').and.returnValue(Promise.resolve(null));

            mockReq.params.id = '60d21b4667d0d8992e610c85';

            await listingController.show(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(jasmine.objectContaining({ status: 404 }));
        });
    });

    describe('deleteListing', () => {
        it('should delete a listing and its image', async () => {
            const listing = { image: { s3Key: 'test-key' } };

            spyOn(Listing, 'findByIdAndDelete').and.returnValue(Promise.resolve(listing));

            spyOn(deleteFile, 'call').and.returnValue(Promise.resolve());

            mockReq.params.id = '60d21b4667d0d8992e610c85';

            await listingController.deleteListing(mockReq, mockRes, mockNext);

            expect(Listing.findByIdAndDelete).toHaveBeenCalledWith('60d21b4667d0d8992e610c85');
            expect(mockReq.flash).toHaveBeenCalledWith('success', 'Your listing has successfully been deleted!');
            expect(mockRes.redirect).toHaveBeenCalledWith('/listings');
        });
    });    

    describe('updateBid', () => {
        it('should not update the bid if it is lower or equal to the current bid', async () => {
            const listing = { bid: 100, _id: '60d21b4667d0d8992e610c85' };
    
            spyOn(Listing, 'findById').and.returnValue(Promise.resolve(listing));
            spyOn(Listing, 'findByIdAndUpdate').and.returnValue(Promise.resolve());
    
            mockReq.params.id = '60d21b4667d0d8992e610c85';
            mockReq.body.bid = 50;
    
            await listingController.updateBid(mockReq, mockRes, mockNext);
    
            expect(Listing.findById).toHaveBeenCalledWith('60d21b4667d0d8992e610c85');
            expect(Listing.findByIdAndUpdate).not.toHaveBeenCalled();
            expect(mockRes.redirect).toHaveBeenCalledWith('/listings/60d21b4667d0d8992e610c85');
        });
    });    
});