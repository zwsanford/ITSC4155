import Account from '../models/account.js';

export const loginPage = (req, res) => {
    res.render('./account/login');
};

export const signupPage = (req, res) => {
    res.render('./account/signup');
};

export const create = (req, res, next) => {
    let account = new Account(req.body);
    if(account.email)
        account.email = account.email.toLowerCase();
    account.save()
        .then(()=>{
            req.flash('success', 'Registration Succeeded!');
            res.redirect('/accounts/login');
        })
        .catch(err => {
            if (err.name === 'ValidationError') {
                req.flash('error', err.message);
                err.status = 400;
            }
            next(err);
        });
};

export const login = (req, res, next) => {
    let { username, password } = req.body;

    Account.findOne({ username: username })
        .then(account => {
            if (account) {
                account.comparePassword(password)
                    .then(isMatch => {
                        if (isMatch) {
                            req.session.user = account;
                            req.flash('success', 'You have successfully logged in!');
                            res.redirect('/');
                        } else {
                            req.flash('error', 'Invalid username or password');
                            res.redirect('/accounts/login');
                        }                        
                })
            }else{
                req.flash('error', 'Wrong email address!');
                res.redirect('/accounts/login');
            }
        })
        .catch(err => next(err));
};

export const logout = (req, res, next) => {
    req.session.destroy(err => {
        if (err) {
            next(err);
        } else {
            res.redirect('/');
        }
    });
}

export default { loginPage, signupPage, create, login, logout };