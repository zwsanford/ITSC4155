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

// define router
const router = express.Router();

// Route to get all listings
router.get('/', index);

// Route for new listing form
router.get('/new', newListing);

// Route to create new listing with file upload
router.post('/', fileUpload, create);

// Route to show specific listing
router.get('/:id', show);

// Route to edit listing form
router.get('/:id/edit', edit);

// Route to update listing with file upload
router.put('/:id', fileUpload, update);

// Route to delete listing
router.delete('/:id', deleteListing);

router.put('/:id/updateBid', update);

export default router;