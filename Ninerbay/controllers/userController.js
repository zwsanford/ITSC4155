import User from '../models/user.js';

export const loginPage = (req, res) => {
    res.render('./users/login');
};

export const signupPage = (req, res) => {
    res.render('./users/signup');
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

export const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            req.flash('error', 'Invalid username or password');
            return res.redirect('/users/login');
        }

        user.comparePassword(password, (err, isMatch) => {
            if (err || !isMatch) {
                req.flash('error', 'Invalid username or password');
                return res.redirect('/users/login');
            }

            req.session.user = user;
            req.flash('success', 'You have successfully logged in!');
            res.redirect('/');
        });
    } catch (err) {
        next(err);
    }
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