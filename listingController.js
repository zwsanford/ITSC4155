const model = require('../models/listing');

exports.index = (req, res)=>{
    let search = req.query.search;
    let listings = model.find(search);
    res.render('./listing/items', {listings});
};

exports.new = (req, res)=>{
    res.render('./listing/new');
};

exports.create = (req, res)=>{
    let listing = req.body;
    if(req.file){
        listing.image = req.file.filename;
    }
    console.log(listing);
    model.save(listing);
    res.redirect('/listings');  
};

exports.show = (req, res, next)=>{
    let id = req.params.id;
    let listing = model.findById(id);
    if (listing){
        res.render('./listing/item', {listing});
    }else{
        let err = new Error('Cannot find a listing with id ' + id);
        err.status = 404;
        next(err);
    }
};

exports.edit = (req, res, next)=>{
    let id = req.params.id;
    let listing = model.findById(id);
    if (listing){
        res.render('./listing/edit', {listing});
    }else{
        let err = new Error('Cannot find a listing with id ' + id);
        err.status = 404;
        next(err);
    }
};

exports.update = (req, res, next)=>{
    let listing = req.body;
    let id = req.params.id;
    if(model.updateById(id, listing)){
        res.redirect('/listings/'+id);
    }else{
        let err = new Error('Cannot find a listing with id ' + id);
        err.status = 404;
        next(err);
    }
};

exports.delete = (req, res, next)=>{
    let id = req.params.id;
    if (model.deleteById(id)){
        res.redirect('/listings');
    }else{
        let err = new Error('Cannot find a listing with id ' + id);
        err.status = 404;
        next(err);
    }
};

