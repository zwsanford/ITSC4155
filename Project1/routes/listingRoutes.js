// routes/listingRoutes.js
import express from 'express';
import {
    newListing,
    index,
    create,
    show,
    edit,
    update,
    deleteListing,
}   from '../controllers/listingController.js';
import { fileUpload } from '../middleware/fileUpload.js';

const router = express.Router();

// Route to get all listings
router.get('/', index);

router.get('/new', newListing);

// Create a new listing with file upload
router.post('/', fileUpload, create);

// Show a specific listing
router.get('/:id', show);

// Edit a listing
router.get('/:id/edit', edit);

// Update a listing with file upload
router.put('/:id', fileUpload, update); // Use the update function

// Delete a listing
router.delete('/:id', deleteListing);

export default router;