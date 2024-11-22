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
        return res.redirect('/users/login');
    }
};

// Check if user is seller of the Item
export const isSeller = (req, res, next) => {
    let id = req.params.id;
    Listing.findById(id)
        .then(listing => {
            if (listing) {
                if (listing.seller == req.session.user) {
                    return next();
                } else {
                    let err = new Error('Unauthorized to access the resource');
                    err.status = 401;
                    return next(err);
                }
            } else {
                let err = new Error('Listing not found');
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => {
            err.status = 500;
            return next(err);
        });
};

// Check if user is not the seller of the Item
export const isNotSeller = (req, res, next) => {
    let id = req.params.id;
    Listing.findById(id)
        .then(listing => {
            if (listing) {
                if (listing.seller != req.session.user) {
                    return next();
                } else {
                    let err = new Error('Unauthorized to access the resource');
                    err.status = 401;
                    return next(err);
                }
            } else {
                let err = new Error('Listing not found');
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => {
            err.status = 500;
            return next(err);
        });
};