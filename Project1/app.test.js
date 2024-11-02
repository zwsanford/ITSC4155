const request = require('supertest');
const app = require('./app'); // Adjust the path based on your app structure


    test('GET / should respond with a 200 status and render the index page',  () => {
        const response =  request(app).get('/');
        expect(response.statusCode).toBe(200); // Check for a 200 OK response
        expect(response.text).toContain('Your Expected Content Here'); // Check for specific content
    });
                                                                    
    test('GET /unknown should respond with a 404 status',  () => {
        const response =  request(app).get('/unknown');
        expect(response.statusCode).toBe(404); // Check for a 404 Not Found response
        expect(response.text).toContain('The server cannot locate'); // Check for error message
    });
