// Import necessary modules
import Listing from '../models/listing.js';
import { getFileUrl, deleteFile } from '../middleware/fileUpload.js';


// New - Display a form to create a new listing
export const newListing = (req, res) => {
    res.render('listing/new');
};

// Index - Show all listings
export const index = async (req, res, next) => {
  try {
    const listings = await Listing.find().sort({ price: 1 });

    // Generate signed URLs for each listing's image
    for (let listing of listings) {
      if (listing.image && listing.image.s3Key) {
        listing.imageUrl = await getFileUrl(listing.image.s3Key); // Attach the signed URL
      }
    }

    res.render('listing/items', { listings });
  } catch (err) {
    next(err);
  }
};

// Update - Update a specific listing
export const update = async (req, res, next) => {
  const id = req.params.id;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    const err = new Error('Invalid listing ID');
    err.status = 400;
    return next(err);
  }

  const listingData = req.body;
  if (req.file && req.file.s3Key) {
    listingData.image = {
      s3Key: req.file.s3Key,
      format: req.file.mimetype.split('/')[1],
      size: req.file.size,
    };
  }

  try {
    await Listing.findByIdAndUpdate(id, listingData, { new: true });
    res.redirect(`/listings/${id}`);
  } catch (err) {
    next(err);
  }
};

// Create a new listing with image upload
export const create = async (req, res, next) => {
  try {
    const listingData = req.body;

    if (req.file && req.file.s3Key) {
      listingData.image = {
        s3Key: req.file.s3Key,
        format: req.file.mimetype.split('/')[1],
        size: req.file.size,
      };
    } else {
      const err = new Error('Image is required');
      err.status = 400;
      return next(err);
    }

    const listing = new Listing(listingData);
    await listing.save();
    res.redirect('/listings');
  } catch (err) {
    if (err.name === 'ValidationError') {
      err.status = 400;
    }
    next(err);
  }
};

// Show - Display a specific listing with its image URL
export const show = async (req, res, next) => {
    const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        const err = new Error('Invalid listing ID');
        err.status = 400;
        return next(err);
    }

    try {
        const listing = await Listing.findById(id);
        if (listing) {
            if (listing.image && listing.image.s3Key) {
                listing.image.url = await getFileUrl(listing.image.s3Key); // Generate signed URL
            }
            res.render('listing/item', { listing });
        } else {
            const err = new Error('Listing not found');
            err.status = 404;
            next(err);
        }
    } catch (err) {
        next(err);
    }
};


// Update a listing with image upload
export const edit = async (req, res, next) => {
    const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      const err = new Error('Invalid listing ID');
      err.status = 400;
      return next(err);
    }
  
    try {
      const listingData = req.body;
      const listing = await Listing.findById(id);
  
      if (!listing) {
        const err = new Error('Listing not found');
        err.status = 404;
        return next(err);
      }
  
      // Update image if a new file is uploaded
      if (req.file && req.file.s3Key) {
        // Delete the old image from S3
        if (listing.image && listing.image.s3Key) {
          await deleteFile(listing.image.s3Key);
        }
  
        listingData.image = {
          s3Key: req.file.s3Key,
          format: req.file.mimetype.split('/')[1],
          size: req.file.size,
        };
      }
  
      await Listing.findByIdAndUpdate(id, listingData, { new: true });
      res.redirect(`/listings/${id}`);
    } catch (err) {
      if (err.name === 'ValidationError') {
        err.status = 400;
      }
      next(err);
    }
};
  
// Delete a listing and its image from S3
export const deleteListing = async (req, res, next) => {
    const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      const err = new Error('Invalid listing ID');
      err.status = 400;
      return next(err);
    }
  
    try {
      const listing = await Listing.findByIdAndDelete(id);
      if (listing) {
        if (listing.image && listing.image.s3Key) {
          await deleteFile(listing.image.s3Key);
        }
        res.redirect('/listings');
      } else {
        const err = new Error('Listing not found');
        err.status = 404;
        next(err);
      }
    } catch (err) {
      next(err);
    }
};  