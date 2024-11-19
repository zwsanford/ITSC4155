import Listing from '../models/listing.js';

//check if user is a guest
export const isGuest = (req, res, next)=>{
    if(!req.session.account){
        return next();
    }
    else{
        req.flash('error', 'You are logged in already');
        return res.redirect('/users/profile');
    }
};

//check if user is authenticated
export const isLoggedIn = (req, res, next)=>{
    if(req.session.account){
        return next();
    }
    else{
        req.flash('error', 'You need to log in first!');
        return res.redirect('/users/login');
    }
};

//check if user is seller of the vinyl
export const isSeller = (req, res, next) =>{
    let id = req.params.id;
    Listing.findById(id)
    .then(listing=>{
        if(listing){
            if(listing.seller == req.session.account){
                return next();
            }else{
                let err = new Error('Unauthorized to access the resource');
                err.status = 401;
                return next(err);
            }
        }
    })
    .catch(err=>next(err));
    
};

export const isNotSeller = (req, res, next) =>{
    let id = req.params.id;
    Listing.findById(id)
    .then(listing=>{
        if(listing){
            if(listing.seller != req.session.account){
                return next();
            }else{
                let err = new Error('Unauthorized to access the resource');
                err.status = 401;
                return next(err);
            }
        }
    })
    .catch(err=>next(err));
    
};