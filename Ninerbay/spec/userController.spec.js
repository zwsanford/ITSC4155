import Account from '../models/user.js';
import * as accountController from '../controllers/userController.js';
import User from '../models/user.js';

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
        let req, res, next;
    
        beforeEach(() => {
            req = {
                body: {},
                flash: jasmine.createSpy('flash'),
                session: {}
            };
            res = {
                redirect: jasmine.createSpy('redirect')
            };
            next = jasmine.createSpy('next');
        });
    
        it('should redirect with an error for invalid password', async () => {
            req.body = { username: 'testuser', password: 'wrongpassword' };
            const user = { comparePassword: jasmine.createSpy('comparePassword').and.callFake((password, cb) => cb(null, false)) };
            spyOn(User, 'findOne').and.resolveTo(user);
            await accountController.login(req, res, next);
            expect(req.flash).toHaveBeenCalledWith('error', 'Invalid username or password');
            expect(res.redirect).toHaveBeenCalledWith('/users/login');
        });
    
        it('should log in a user with valid credentials', async () => {
            req.body = { username: 'testuser', password: 'correctpassword' };
            const user = { comparePassword: jasmine.createSpy('comparePassword').and.callFake((password, cb) => cb(null, true)) };
            spyOn(User, 'findOne').and.resolveTo(user);
            await accountController.login(req, res, next);
            expect(req.session.user).toBe(user);
            expect(req.flash).toHaveBeenCalledWith('success', 'You have successfully logged in!');
            expect(res.redirect).toHaveBeenCalledWith('/');
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