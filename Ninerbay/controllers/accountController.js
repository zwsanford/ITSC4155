import Account from '../models/account.js';

export const loginPage = (req, res) => {
    res.render('./account/login');
};

export const signupPage = (req, res) => {
    res.render('./account/signup');
};

export const create = async (req, res, next) => {
    try {
        let account = new Account(req.body);
        if (account.email) account.email = account.email.toLowerCase();

        await account.save();
        req.flash('success', 'Registration Succeeded!');
        next();
    } catch (err) {
        if (err.name === 'ValidationError') {
            req.flash('error', err.message);
            err.status = 400;
        }
        next(err);
    }
};

export const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const account = await Account.findOne({ username });
        if (!account) {
            req.flash('error', 'Wrong email address!');
            return res.redirect('/accounts/login');
        }

        const isMatch = await account.comparePassword(password);
        if (isMatch) {
            req.session.user = account; // Set session user
            req.flash('success', 'You have successfully logged in!');
            return res.redirect('/'); // Redirect to home
        } else {
            req.flash('error', 'Invalid username or password');
            return res.redirect('/accounts/login');
        }
    } catch (err) {
        next(err);
    }
};

export const logout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            next(err);
            console.log('Error destroying session:', err);
        } else {
            console.log('Session destroyed successfully');
            res.redirect('/');
        }
    });
};

export default { loginPage, signupPage, create, login, logout };