const request = require('supertest');
const app = require('./app'); // Adjust the path based on your app structure

describe('Sell Page Tests', () => {
    // Test for rendering the Sell Page
    test('GET /sell should load the Sell Page', async () => {
        const response = await request(app)
            .get('/sell') // Adjust this route as necessary
            .expect(200); // Check that the response status code is 200

        // Check for essential elements in the Sell page
        expect(response.text).toContain('SELL THROUGH NinerBay'); // Check for the heading
        expect(response.text).toContain('If you have an item you wish to sell through us'); // Check for description
        expect(response.text).toContain('Condition:'); // Check for condition label
        expect(response.text).toContain('Title:'); // Check for title label
        expect(response.text).toContain('Price:'); // Check for price label
        expect(response.text).toContain('Details:'); // Check for details label
        expect(response.text).toContain('Seller:'); // Check for seller label
        expect(response.text).toContain('Image:'); // Check for image label
        expect(response.text).toContain('Submit'); // Check for submit button
    });

    // Test for form submission with valid data
    test('POST /listings with valid data', async () => {
        const response = await request(app)
            .post('/listings')
            .field('condition', 'New')
            .field('title', 'Test Item')
            .field('price', '19.99')
            .field('details', 'This is a test item.')
            .field('seller', 'Test Seller')
            .attach('image', 'path/to/test-image.jpg') // Use a valid path to a test image
            .expect(302); // Assuming it redirects on success

        expect(response.header.location).toBe('/success'); // Adjust this to your expected redirect
    });

    // Test for form submission with missing required fields
    test('POST /listings with missing required fields', async () => {
        const response = await request(app)
            .post('/listings')
            .field('title', 'Test Item') // Only title provided
            .expect(400); // Expecting a 400 Bad Request for missing required fields

        expect(response.text).toContain('Please fill out all required fields'); // Adjust based on your validation messages
    });
});