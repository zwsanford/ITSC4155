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

