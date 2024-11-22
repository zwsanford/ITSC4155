import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Account from './account';

describe('Account Model Tests', () => {
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    afterEach(async () => {
        await Account.deleteMany({});
    });

    test('should save an account with hashed password', async () => {
        const accountData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'securepassword',
        };

        const account = new Account(accountData);
        await account.save();

        expect(account.password).not.toBe(accountData.password); // Password should be hashed
        expect(account.username).toBe(accountData.username);
        expect(account.email).toBe(accountData.email);
    });

    test('should compare passwords correctly', async () => {
        const accountData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'securepassword',
        };

        const account = new Account(accountData);
        await account.save();

        const isMatch = await account.comparePassword('securepassword');
        const isMismatch = await account.comparePassword('wrongpassword');

        expect(isMatch).toBe(true);
        expect(isMismatch).toBe(false);
    });

    test('should throw validation errors for missing fields', async () => {
        const account = new Account({});

        try {
            await account.save();
        } catch (err) {
            expect(err.errors.username).toBeDefined();
            expect(err.errors.email).toBeDefined();
            expect(err.errors.password).toBeDefined();
        }
    });

    test('should only hash the password if it is modified', async () => {
        const account = new Account({
            username: 'testuser',
            email: 'test@example.com',
            password: 'securepassword',
        });

        await account.save();
        const hashedPassword = account.password;

        account.username = 'updateduser';
        await account.save();

        expect(account.password).toBe(hashedPassword); // Password should remain the same
    });
});