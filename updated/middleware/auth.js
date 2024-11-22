import Listing from '../models/listing.js';

// Check if user is a guest
export const isGuest = (req, res, next) => {
    if (!req.session.user) {
        return next();
    } else {
        req.flash('error', 'You are logged in already');
        return res.redirect('/listings');
    }
};

// Check if user is authenticated
export const isLoggedIn = (req, res, next) => {
    if (req.session.user) {
        return next();
    } else {
        req.flash('error', 'You need to log in first!');
        return res.redirect('/accounts/login'); // Fixed redirect path
    }
};

// Check if user is the seller of the listing
export const isSeller = async (req, res, next) => {
    const { id } = req.params;

    if (!req.session || !req.session.user) {
        const err = new Error('User is not logged in');
        err.status = 401;
        return next(err);
    }

    try {
        const listing = await Listing.findById(id);
        if (!listing) {
            const err = new Error('Listing not found');
            err.status = 404;
            return next(err);
        }

        if (listing.seller.equals(req.session.user._id)) {
            return next();
        } else {
            const err = new Error('Unauthorized to access the resource');
            err.status = 401;
            return next(err);
        }
    } catch (err) {
        next(err);
    }
};

// Check if user is NOT the seller of the listing
export const isNotSeller = async (req, res, next) => {
    const { id } = req.params;

    if (!req.session || !req.session.user) {
        const err = new Error('User is not logged in');
        err.status = 401;
        return next(err);
    }

    try {
        const listing = await Listing.findById(id);
        if (!listing) {
            const err = new Error('Listing not found');
            err.status = 404;
            return next(err);
        }

        if (!listing.seller.equals(req.session.user._id)) {
            return next();
        } else {
            const err = new Error('Unauthorized to access the resource');
            err.status = 401;
            return next(err);
        }
    } catch (err) {
        next(err);
    }
};