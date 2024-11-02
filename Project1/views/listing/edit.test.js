const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('./app'); 
const Listing = require('./models/listing'); 

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

test('PUT /listings/:id should update a listing', async () => {
    // First, create a listing to update
    const listingData = {
        title: 'Test Listing',
        condition: 'New',
        price: 100,
        details: 'Test details',
        seller: 'Test Seller',
        image: 'public/images/couch.jpg'
    };

    const listing = await Listing.create(listingData);

    const updatedData = {
        title: 'Updated Listing',
        condition: 'Like New',
        price: 150,
        details: 'Updated details',
        seller: 'Updated Seller',
        image: 'public/images/IkeaChair.jpg'
    };

    const response = await request(app)
        .put(`/listings/${listing._id}`)
        .send(updatedData) // Send the updated data
        .set('Accept', 'application/json');

    expect(response.statusCode).toBe(200); // Check for successful update
    expect(response.body).toHaveProperty('message', 'Listing updated successfully'); // Assuming you send a success message

    // Verify the listing was updated in the database
    const updatedListing = await Listing.findById(listing._id);
    expect(updatedListing.title).toBe('Updated Listing');
    expect(updatedListing.price).toBe(150);
});

test('PUT /listings/:id should return 404 for non-existing listing', async () => {
    const response = await request(app)
        .put('/listings/60d5ec49f3d0e1005c2d9c3e') // Use a random non-existing ID
        .send({
            title: 'Non-existing Listing',
            condition: 'New',
            price: 100,
            details: 'Test details',
            seller: 'Test Seller',
            image: '/public.images/ElectricScooter.jpg'
        });

    expect(response.statusCode).toBe(404); // Check for 404 Not Found
});