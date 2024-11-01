const express = require('express');
const controller = require('../controllers/accountController');
const router = express.Router();
const {fileUpload} = require('../middleware/fileUpload')

router.get('/login', controller.login);

router.get('/signup', controller.signup);

router.post('/', controller.create);

router.post('/check', controller.logged);

module.exports = router