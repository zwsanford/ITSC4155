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
        .then(listing => res.redirect('/accounts/login'))
        .catch(err => {
            if (err.name === 'ValidationError') {
                err.status = 400;
            }
            next(err); 
        });
}

// exports.logged = (req, res, next)=>{
//     let account = new model(req.body);
//     if(account)
// }