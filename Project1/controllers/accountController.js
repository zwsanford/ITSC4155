import model from '../models/account.js';

const login = (req, res) => {
    res.render('./account/login');
};

const signup = (req, res) => {
    res.render('./account/signup');
};

const create = (req, res, next) => {
    const account = new model(req.body);
    account.save()
        .then(account => res.redirect('/accounts/login'))
        .catch(err => {
            if (err.name === 'ValidationError') {
                err.status = 400;
            }
            next(err);
        });
};

const logged = (req, res, next) => {
    const { username, password } = req.body;

    model.findOne({ username, password })
        .then(account => {
            if (!account) {
                const err = new Error('Invalid username or password');
                err.status = 400;
                return next(err);
            }
            res.render('./account/profile', { account });
        })
        .catch(err => next(err));
};

export default { login, signup, create, logged };