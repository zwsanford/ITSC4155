const model = require('../models/listing');

exports.index = (req, res, next) => {
    let search = req.query.search; // Get the search query from request query parameters
    let query = {}; // Define an empty query object

    if (search) {
        // If search query exists, define a MongoDB query to search for titles or details containing the search string
        query = {
            $or: [
                { title: { $regex: search, $options: 'i' } }, // Case-insensitive search for title
                { details: { $regex: search, $options: 'i' } } // Case-insensitive search for details
            ]
        };
    }

    // Use the find method of the listing model to search for listings based on the query and sort by price ascending
    model.find(query).sort({price:1})
    .then(listings=>res.render('./listing/items', {listings}))
    .catch(err=>next(err));
};

exports.new = (req, res)=>{
    res.render('./listing/new');
};

exports.create = (req, res, next) => {
    let listing = new model(req.body);
    if (req.file) {
        listing.image = "/images/" + req.file.filename;
    }
    listing.save()
        .then(listing => res.redirect('/listings'))
        .catch(err => {
            if (err.name === 'ValidationError') {
                err.status = 400;
            }
            next(err); 
        });
};


exports.show = (req, res, next)=>{
    let id = req.params.id;
    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        let err = new Error('Invalid listing id');
        err.status = 400;
        return next(err);
    }
    model.findById(id)
    .then(listing=>{
        if(listing){
            return res.render('./listing/item', {listing});
        }else{
            let err = new Error('Cannot find a listing with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
};

exports.edit = (req, res, next)=>{
    let id = req.params.id;

    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        let err = new Error('Invalid listing id');
        err.status = 400;
        return next(err);
    }
    
    model.findById(id)
    .then(listing=>{
        if(listing){
            return res.render('./listing/edit', {listing});
        }else{
            let err = new Error('Cannot find a listing with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
};

exports.update = (req, res, next)=>{
    let id = req.params.id;

    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        let err = new Error('Invalid listing id');
        err.status = 400;
        return next(err);
    }
    let listing = req.body;

    if(req.file){
        listing.image = "/images/" + req.file.filename;
    }

    model.findByIdAndUpdate(id, listing, {new: true})
    .then(listing=>{
        if (listing){
            res.redirect('/listings/'+id);
        }else{
            let err = new Error('Cannot find a listing with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>{
        if(err.name === 'ValidationError'){
            err.status = 400;
        }
        next(err);
    });
};

exports.delete = (req, res, next)=>{
    let id = req.params.id;

    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        let err = new Error('Invalid listing id');
        err.status = 400;
        return next(err);
    }

    model.findByIdAndDelete(id)
    .then(listing=>{
        if(listing){
            res.redirect('/listings');
        }else{
            let err = new Error('Cannot find a listing with id ' + id);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err=>next(err));
};
