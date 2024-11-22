// import modules
import express from 'express';
import {
    newListing,
    index,
    create,
    show,
    edit,
    update,
    deleteListing,
    updateBid,
}   from '../controllers/listingController.js';
import { fileUpload } from '../middleware/fileUpload.js';
import { validateId, validateResult, validateListing } from '../middleware/validator.js';
import { isLoggedIn, isSeller} from '../middleware/auth.js';

// define router
const router = express.Router();

// Route to get all listings
router.get('/', index);

// Route for new listing form
router.get('/new', isLoggedIn, newListing);

// Route to create new listing with file upload
router.post('/', isLoggedIn, fileUpload, validateListing, validateResult, create);

// Route to show specific listing
router.get('/:id', validateId, show);

// Route to edit listing form
router.get('/:id/edit', validateId, isLoggedIn, isSeller, edit);

// Route to update listing with file upload
router.put('/:id', validateId, isLoggedIn, isSeller, fileUpload, validateListing, update);

// Route to delete listing
router.delete('/:id', validateId, isLoggedIn, isSeller, deleteListing);

//Route to update bid
router.put('/:id/updateBid', validateId, isLoggedIn, update);

export default router;