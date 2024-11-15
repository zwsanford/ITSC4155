import model from '../models/account.js';
export const login = (req, res) => {
    res.render('./account/login');
};

export const signup = (req, res) => {
    res.render('./account/signup');
};

export const create = (req, res, next) => {
    let account = new model(req.body);
    if(account.email)
        account.email = account.email.toLowerCase();
    account.save()
        .then(account => res.redirect('/accounts/login'))
        .catch(err => {
            if (err.name === 'ValidationError') {
                err.status = 400;
            }
            next(err);
        });
};

export const logged = (req, res, next) => {
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
