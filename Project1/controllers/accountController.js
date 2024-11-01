const model = require('../models/account');


exports.login = (req, res)=>{
    res.render('./account/login');
}

exports.signup = (req, res)=>{
    res.render('./account/signup');
}

exports.create = (req, res, next)=>{
    let account = new model(req.body);
    account.save()
        .then(account => res.redirect('/accounts/login'))
        .catch(err => {
            if (err.name === 'ValidationError') {
                err.status = 400;
            }
            next(err); 
        });
}

exports.logged = (req, res, next)=>{
    let account = req.body;
    
    if(!account.username.find(username) && !account.password.find(password)){
        let err = new Error('Invalid username or password');
        err.status = 400;
        return next(err);
    }
    res.render('./account/signup');
    
}