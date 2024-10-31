
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const listings = new Schema({
    id: {type: Number, unique: true},
    seller: {type: String},
    condition: {type: String},
    price: {type: String},
    details: {type: String},
    image: {type: String},
    totalOffers: {type: Number},
 
 });

exports.save = function(listing){
    listing.id = uuidv4();
    listing.image = '/images/' + listing.image;
    listing.totalOffers = 0;
    listing.seller = 'Harrison';
    listing.price = listing.price;
    listings.push(listing);
}

 module.exports = mongoose.model('Card', listings);


