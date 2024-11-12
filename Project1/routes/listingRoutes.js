// routes/listingRoutes.js
import express from 'express';
import {
  create,
  show,
  edit,
  deleteListing,
} from '../controllers/listingController.js';
import { fileUpload } from '../middleware/fileUpload.js';

const router = express.Router();
// Create a new listing with file upload
router.post('/', fileUpload, create);

// Show a specific listing
router.get('/:id', show);

// Edit a listing
router.get('/:id/edit', edit);

// Update a listing with file upload
router.put('/:id', fileUpload, edit);

// Delete a listing
router.delete('/:id', deleteListing);

export default router;