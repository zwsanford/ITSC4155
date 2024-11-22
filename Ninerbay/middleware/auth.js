import Listing from '../models/listing.js';

//check if user is a guest
export const isGuest = (req, res, next)=>{
    if(!req.session.user){
        return next();
    }
    else{
        req.flash('error', 'You are logged in already');
        return res.redirect('/listings');
    }
};

//check if user is authenticated
export const isLoggedIn = (req, res, next)=>{
    if(req.session.user){
        return next();
    }
    else{
        req.flash('error', 'You need to log in first!');
        return res.redirect('/accounts/login');
    }
};

export const isSeller = (req, res, next) => {
    let id = req.params.id;
    Listing.findById(id)
        .then(listing => {
            if (!listing) {
                const err = new Error('Listing not found');
                err.status = 404;
                return next(err);
            }

            if (listing.seller == req.session.account) {
                return next();
            } else {
                const err = new Error('Unauthorized to access the resource');
                err.status = 401;
                return next(err);
            }
        })
        .catch(err => next(err));
};

export const isNotSeller = (req, res, next) => {
    let id = req.params.id;
    Listing.findById(id)
        .then(listing => {
            if (!listing) {
                const err = new Error('Listing not found');
                err.status = 404;
                return next(err);
            }

            if (listing.seller != req.session.account) {
                return next();
            } else {
                const err = new Error('Unauthorized to access the resource');
                err.status = 401;
                return next(err);
            }
        })
        .catch(err => next(err));
};