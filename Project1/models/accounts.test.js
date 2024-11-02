const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Account = require('./models/account'); 

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// Test for creating an account with valid data
test('create account with valid data', async () => {
    const account = await Account.create({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123'
    });
    expect(account.username).toBe('testuser');
});

// Test for creating an account without username
test('create account without username', async () => {
    await expect(Account.create({
        email: 'testuser@example.com',
        password: 'password123'
    })).rejects.toThrow('username is required');
});