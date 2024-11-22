import { body, validationResult } from 'express-validator';

export const validateId = (req, res, next) => {
    let id = req.params.id;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        return next();
    } else {
        let err = new Error('Cannot find a listing with id ' + id);
        err.status = 400;
        return next(err);
    }
};

export const validateSignUp = [
    body('username', 'Username cannot be empty').notEmpty().trim().escape(),
    body('email', 'Email must be a valid email address').isEmail().trim().escape().normalizeEmail(),
    body('password', 'Password must be at least 8 characters and at most 64 characters').isLength({ min: 8, max: 64 }),
];

export const validateResult = (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => {
            req.flash('error', error.msg);
        });
        return res.redirect('back');
    } else {
        return next();
    }
};

export const validateListing = [
    body('title', 'Title must be a valid title').notEmpty().trim().escape(),
    body('condition', 'Condition must be valid').notEmpty().trim().escape().isIn(['New', 'Like New', 'Good', 'Fair', 'Poor']),
    body('price', 'Price must be numeric and greater than or equal to 0').notEmpty().trim().escape().isNumeric({ min: 0 }),
    body('details', 'Details must not be empty').notEmpty().trim().escape(),
    body('image', 'Image must be uploaded').custom((value, { req }) => {
        if (!req.file || !req.file.s3Key) {
          throw new Error('Image is required');
        }
        return true;
      }),
    body('totalOffers', 'Total offers must be valid').trim().escape(),
    body('active', 'Active status must be valid').trim().escape(),
    body('bid', 'Highest bid must be numeric and greater than or equal to 0')
    .optional()
    .isNumeric({ min: 0 }),];
