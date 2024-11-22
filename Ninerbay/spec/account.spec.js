import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Account from '../models/user.js';

describe('Account Model', () => {
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    afterEach(async () => {
        // Clear all collections after each test
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany();
        }
    });

    it('should hash the password before saving', async () => {
        const accountData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'securepassword',
        };

        const account = new Account(accountData);
        await account.save();

        // Verify the password is hashed
        expect(account.password).not.toBe(accountData.password);
        expect(account.password.length).toBeGreaterThan(0);
    });

    it('should compare passwords correctly', async () => {
        const accountData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'securepassword',
        };

        const account = new Account(accountData);
        await account.save();

        // Verify correct password matches
        const isMatch = await account.comparePassword('securepassword');
        expect(isMatch).toBeTrue();

        // Verify incorrect password does not match
        const isMismatch = await account.comparePassword('wrongpassword');
        expect(isMismatch).toBeFalse();
    });
});