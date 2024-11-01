const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {type: String, required: [true, 'title is required']},
    seller: {type: String, required: [true, 'seller is required']},
    condition: {type: String, required: [true, 'Condition is required'], enum: ['New', 'Like New', 'Good', 'Fair', 'Poor']},
    price: {type: Number, required: [true, 'price is required'], min: 0.01},
    details: {type: String, required: [true, 'details is required'], minLength: [10, 'the details describing the Listing should be at least 10 characters']},
    image: {type: String, required: [true, 'image is required']},
    totalOffers: {type: Number, default: 0},
    active: {type: Boolean, default: true}
});

module.exports = mongoose.model('Listing', listingSchema);


exports.find = function(search){
    let sortlistings = listings.sort((a, b)=>a.price - b.price);
    if(search){
        search = search.toLocaleLowerCase();
        sortlistings = sortlistings.filter(listing => (
            listing.title.toLowerCase().includes(search) || 
            listing.details.toLowerCase().includes(search)
        ));

    }
    return sortlistings;
}

exports.findById = function(id){
    return listings.find(listing=>listing.id ===id);
}

exports.save = function(listing){
    listing.id = uuidv4();
    listing.image = '/images/' + listing.image;
    listing.totalOffers = 0;
    listing.seller = 'Harrison';
    listing.price = listing.price;
    listings.push(listing);
}

exports.updateById = function(id, newlisting){
    let listing = listings.find(listing=>listing.id ===id);
    if(listing){
        listing.condition = newlisting.condition;
        listing.title = newlisting.title;
        listing.price = newlisting.price;
        listing.details = newlisting.details;
        listing.image = '/images/' + newlisting.image;
        return true;
    }else{
        return false;
    }

}

exports.deleteById = function(id){
    let index = listings.findIndex(story => story.id ===id);
    if (index !== -1){
        listings.splice(index, 1);
        return true
    }else{
        return false;
    }
}
