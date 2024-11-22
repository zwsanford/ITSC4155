import User from '../models/user.js';

export const loginPage = (req, res) => {
    res.render('./user/login');
};

export const signupPage = (req, res) => {
    res.render('./user/signup');
};

export const create = (req, res, next) => {
    
    let user = new User(req.body);
    if(user.email)
        user.email = user.email.toLowerCase();
    user.save()
        .then(()=>{
            req.flash('success', 'Registration Succeeded!');
            next();
            // res.redirect('/users/login');
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

    User.findOne({ username: username })
        .then(user => {
            if (user) {
                user.comparePassword(password)
                    .then(isMatch => {
                        if (isMatch) {
                            req.session.user = user._id;
                            req.flash('success', 'You have successfully logged in!');
                            res.redirect('/');
                        } else {
                            req.flash('error', 'Invalid username or password');
                            res.redirect('/users/login');
                        }                        
                })
            }else{
                req.flash('error', 'Wrong email address!');
                res.redirect('/users/login');
            }
        })
        .catch(err => next(err));
};

export const logout = (req, res, next) => {
    req.session.destroy(err => {
        if (err) {
            next(err);
            console.log('Error destroying session:', err);
        } else {
            console.log('Session destroyed successfully');
            res.redirect('/');
        }
    });
}

export default { loginPage, signupPage, create, login, logout };