// models/listing.js
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: { type: String, required: [true, 'Title is required'] },
  seller: {type: Schema.Types.ObjectId, ref: 'User'},
  condition: {
    type: String,
    required: [true, 'Condition is required'],
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
  },
  price: { type: Number, required: [true, 'Price is required'], min: 0.01 },
  details: {type: String, required: [true, 'Details are required']},
  image: {
    s3Key: { type: String, required: [true, 'Image S3 key is required'] },
    format: { type: String },
    size: { type: Number },
  },
  totalOffers: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  bid: { type: Number, default: 0 }
});

export default mongoose.model('Listing', listingSchema);