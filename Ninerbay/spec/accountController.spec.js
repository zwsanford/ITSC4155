import Account from '../models/account.js';
import * as accountController from '../controllers/accountController.js';

describe('Account Controller', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
            body: {},
            session: {},
            flash: jasmine.createSpy('flash'),
        };
        mockRes = {
            render: jasmine.createSpy('render'),
            redirect: jasmine.createSpy('redirect'),
        };
        mockNext = jasmine.createSpy('next');
    });

    describe('create', () => {
        it('should save a new account and flash success message', async () => {
            spyOn(Account.prototype, 'save').and.returnValue(Promise.resolve());

            mockReq.body = { email: 'test@example.com' };

            await accountController.create(mockReq, mockRes, mockNext);

            expect(Account.prototype.save).toHaveBeenCalled();
            expect(mockReq.flash).toHaveBeenCalledWith('success', 'Registration Succeeded!');
            expect(mockNext).toHaveBeenCalled();
        });
    });

    describe('login', () => {
        it('should log in a user with valid credentials', async () => {
            const mockAccount = {
                comparePassword: jasmine.createSpy('comparePassword').and.returnValue(Promise.resolve(true)),
            };
            spyOn(Account, 'findOne').and.returnValue(Promise.resolve(mockAccount));

            mockReq.body = { username: 'testuser', password: 'password123' };

            await accountController.login(mockReq, mockRes, mockNext);

            expect(Account.findOne).toHaveBeenCalledWith({ username: 'testuser' });
            expect(mockAccount.comparePassword).toHaveBeenCalledWith('password123');
            expect(mockReq.session.user).toBe(mockAccount);
            expect(mockReq.flash).toHaveBeenCalledWith('success', 'You have successfully logged in!');
            expect(mockRes.redirect).toHaveBeenCalledWith('/');
        });

        it('should redirect with an error for invalid password', async () => {
            const mockAccount = {
                comparePassword: jasmine.createSpy('comparePassword').and.returnValue(Promise.resolve(false)),
            };
            spyOn(Account, 'findOne').and.returnValue(Promise.resolve(mockAccount));

            mockReq.body = { username: 'testuser', password: 'wrongpassword' };

            await accountController.login(mockReq, mockRes, mockNext);

            expect(Account.findOne).toHaveBeenCalledWith({ username: 'testuser' });
            expect(mockAccount.comparePassword).toHaveBeenCalledWith('wrongpassword');
            expect(mockReq.flash).toHaveBeenCalledWith('error', 'Invalid username or password');
            expect(mockRes.redirect).toHaveBeenCalledWith('/accounts/login');
        });
    });

    describe('logout', () => {
        it('should destroy the session and redirect to home page', () => {
            mockReq.session.destroy = jasmine.createSpy('destroy').and.callFake((callback) => callback(null));

            accountController.logout(mockReq, mockRes, mockNext);

            expect(mockReq.session.destroy).toHaveBeenCalled();
            expect(mockRes.redirect).toHaveBeenCalledWith('/');
        });
    });
});