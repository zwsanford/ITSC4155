// models/listing.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const listingSchema = new Schema({
  title: { type: String, required: [true, 'Title is required'] },
  seller: { type: String, required: [true, 'Seller is required'] },
  condition: {
    type: String,
    required: [true, 'Condition is required'],
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
  },
  price: { type: Number, required: [true, 'Price is required'], min: 0.01 },
  details: {
    type: String,
    required: [true, 'Details are required'],
    minLength: [10, 'Details should be at least 10 characters'],
  },
  image: {
    s3Key: { type: String, required: [true, 'Image S3 key is required'] },
    format: { type: String },
    size: { type: Number },
  },
  totalOffers: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
});

export default mongoose.model('Listing', listingSchema);