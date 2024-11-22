// import modules
import Listing from '../models/listing.js';
import { getFileUrl, deleteFile } from '../middleware/fileUpload.js';


// display form for new listing creation
export const newListing = (req, res) => {
    res.render('listing/new');
};

// show all listings
export const index = async (req, res, next) => {
    try {
      const search = req.query.search;
      let query = {};
  
      if (search) {
        query = {
          title: { $regex: search, $options: 'i' } // Case-insensitive search for title
        };
      }
  
      // Fetch listings from the database
      const listings = await Listing.find(query).sort({ price: 1 });
  
      // Generate signed URLs for each listing's image
      for (let listing of listings) {
        if (listing.image && listing.image.s3Key) {
          listing.imageUrl = await getFileUrl(listing.image.s3Key); // Attach the signed URL
        }
      }
  
      // Render the view with listings and search term
      res.render('listing/items', { listings, search });
    } catch (err) {
      console.error('Error in index controller:', err);
      next(err);
    }
  };

// update listing with image upload
export const update = async (req, res, next) => {
  const id = req.params.id;
  
  // Check if the ID is valid
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    const err = new Error('Invalid listing ID');
    err.status = 400;
    return next(err);
  }

  try {
    // Fetch the listing document by ID
    const listing = await Listing.findById(id);
    if (!listing) {
      const err = new Error('Listing not found');
      err.status = 404;
      return next(err);
    }

    // Prepare the updated listing data
    const listingData = { ...req.body };

    // Update image if a new file is uploaded
    if (req.file && req.file.s3Key) {
      // Delete the old image from S3
      if (listing.image && listing.image.s3Key) {
        await deleteFile(listing.image.s3Key);
      }

      // Set the new image data
      listingData.image = {
        s3Key: req.file.s3Key,
        format: req.file.mimetype.split('/')[1],
        size: req.file.size,
      };
    }

    // Update the listing document with new data
    await Listing.findByIdAndUpdate(id, listingData, { new: true });
    
    // Redirect to the listing's page
    res.redirect(`/listings/${id}`);
  } catch (err) {
    if (err.name === 'ValidationError') {
      err.status = 400;
    }
    next(err);
  }
};

// create new listing with image upload
export const create = async (req, res, next) => {
  try {
    const listingData = new Listing(req.body);

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

    listingData.active = listingData.active === 'true' || listingData.active === true;
    
    listingData.seller = req.session.user;
    console.log("LISTING DATA:", listingData);

    const listing = new Listing(listingData);
    await listing.save();

    req.flash('success', 'Listing created successfully!');
    res.redirect('/listings');
  } catch (err) {
    if (err.name === 'ValidationError') {
      err.status = 400;
    }
    next(err);
  }
};

// show listing using image url
export const show = async (req, res, next) => {
  const id = req.params.id;

  // Check if the ID format is valid
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      const err = new Error('Invalid listing ID');
      err.status = 400;
      return next(err);
  }

  try {
      // Fetch the listing and populate the seller field
      const listing = await Listing.findById(id).populate('seller', 'username');
      if (listing) {
          // Generate signed image URL, if image exists
          if (listing.image && listing.image.s3Key) {
              listing.image.url = await getFileUrl(listing.image.s3Key);
          }

          // Render the listing page
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


// display listing edit form
export const edit = async (req, res, next) => {
  const id = req.params.id;

  // Check if the ID format is valid
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    const err = new Error('Invalid listing ID');
    err.status = 400;
    return next(err);
  }

  try {
    // Fetch the listing by ID
    const listing = await Listing.findById(id);
    if (!listing) {
      const err = new Error('Listing not found');
      err.status = 404;
      return next(err);
    }

    // Generate the signed URL for the current image, if it exists
    if (listing.image && listing.image.s3Key) {
      listing.imageUrl = await getFileUrl(listing.image.s3Key); // Attach the signed URL
    }

    // Render the edit form and pass the listing data
    res.render('listing/edit', { listing });
  } catch (err) {
    next(err);
  }
};
  
// delete listing and its image from S3
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
          req.flash('success', 'Your listing has successfully been deleted!');
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

export const updateBid = async (req, res, next) => {
  const id = req.params.id;
  const bid = req.body.bid;
  try {
    // Fetch the listing by ID
    const listing = await Listing.findById(id);
    if (!listing) {
      const err = new Error('Listing not found');
      err.status = 404;
      return next(err);
    }

    if (listing.bid < bid) {
      await Listing.findByIdAndUpdate(id, bid, { new: true });
    }
  }
  catch(err){
    next(err);
  }
  // Redirect to the listing's page
  res.redirect(`/listings/${id}`);
};