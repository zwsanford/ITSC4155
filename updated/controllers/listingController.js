// Import modules
import Listing from '../models/listing.js';
import { getFileUrl, deleteFile } from '../middleware/fileUpload.js';

export const create = async (req, res, next) => {
    try {
        if (!req.session.user) {
            const err = new Error('User is not logged in');
            err.status = 401;
            return next(err);
        }

        const { title, description, image } = req.body;

        if (!image) {
            const err = new Error('Image is required');
            err.status = 400;
            return next(err);
        }

        const listing = new Listing({
            title,
            description,
            image,
            seller: req.session.user._id,
        });

        await listing.save();
        res.redirect('/listings');
    } catch (err) {
        if (err.name === 'ValidationError') {
            err.status = 400;
        }
        next(err);
    }
};

// Display form for new listing creation
export const newListing = (req, res) => {
    res.render('listing/new');
};

// Show all listings
export const index = async (req, res, next) => {
    try {
        const search = req.query.search;
        let query = {};

        if (search) {
            query = {
                title: { $regex: search, $options: 'i' }, // Case-insensitive search for title
            };
        }

        const listings = await Listing.find(query).sort({ price: 1 });

        for (let listing of listings) {
            if (listing.image && listing.image.s3Key) {
                listing.imageUrl = await getFileUrl(listing.image.s3Key);
            }
        }

        res.render('listing/items', { listings, search });
    } catch (err) {
        next(err);
    }
};

// Update listing with image upload
export const update = async (req, res, next) => {
    const id = req.params.id;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        const err = new Error('Invalid listing ID');
        err.status = 400;
        return next(err);
    }

    try {
        const listing = await Listing.findById(id);
        if (!listing) {
            const err = new Error('Listing not found');
            err.status = 404;
            return next(err);
        }

        const listingData = { ...req.body };

        if (req.file && req.file.s3Key) {
            if (listing.image && listing.image.s3Key) {
                await deleteFile(listing.image.s3Key);
            }

            listingData.image = {
                s3Key: req.file.s3Key,
                format: req.file.mimetype.split('/')[1],
                size: req.file.size,
            };
        }

        if (listingData.bid && listingData.bid > listing.bid) {
            listingData.totalOffers = (listing.totalOffers || 0) + 1;
        } else {
            listingData.bid = listing.bid; // Retain the old bid if not higher
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

// Display listing edit form
export const edit = async (req, res, next) => {
    const id = req.params.id;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        const err = new Error('Invalid listing ID');
        err.status = 400;
        return next(err);
    }

    try {
        const listing = await Listing.findById(id);
        if (!listing) {
            const err = new Error('Listing not found');
            err.status = 404;
            return next(err);
        }

        if (listing.image && listing.image.s3Key) {
            listing.imageUrl = await getFileUrl(listing.image.s3Key);
        }

        res.render('listing/edit', { listing });
    } catch (err) {
        next(err);
    }
};

// Update bid for a listing
export const updateBid = async (req, res, next) => {
    const id = req.params.id;
    const newBid = parseFloat(req.body.bid);

    if (!id.match(/^[0-9a-fA-F]{24}$/) || isNaN(newBid)) {
        const err = new Error('Invalid data provided');
        err.status = 400;
        return next(err);
    }

    try {
        const listing = await Listing.findById(id);
        if (!listing) {
            const err = new Error('Listing not found');
            err.status = 404;
            return next(err);
        }

        if (newBid > listing.bid) {
            await Listing.findByIdAndUpdate(
                id,
                { bid: newBid, $inc: { totalOffers: 1 } },
                { new: true }
            );
        }

        res.redirect(`/listings/${id}`);
    } catch (err) {
        next(err);
    }
};


// Delete listing and its image from S3
export const deleteListing = async (req, res, next) => {
  const id = req.params.id;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      const err = new Error('Invalid listing ID');
      err.status = 400;
      return next(err);
  }

  try {
      const listing = await Listing.findByIdAndDelete(id);
      if (!listing) {
          const err = new Error('Listing not found');
          err.status = 404;
          return next(err);
      }
      if (listing.image && listing.image.s3Key) {
          await deleteFile(listing.image.s3Key);
      }
      req.flash('success', 'Your listing has successfully been deleted!');
      return res.redirect('/listings');
  } catch (err) {
      next(err);
  }
};

// Show listing using image URL
export const show = async (req, res, next) => {
  const id = req.params.id;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      const err = new Error('Invalid listing ID');
      err.status = 400;
      return next(err);
  }

  try {
      const listing = await Listing.findById(id);
      if (!listing) {
          const err = new Error('Listing not found');
          err.status = 404;
          return next(err);
      }
      if (listing.image && listing.image.s3Key) {
          listing.image.url = await getFileUrl(listing.image.s3Key);
      }
      res.render('listing/item', { listing });
  } catch (err) {
      next(err);
  }
};