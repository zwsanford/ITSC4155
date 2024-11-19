import express from 'express';
import controller from '../controllers/accountController.js';
import {isGuest, isLoggedIn} from '../middleware/auth.js';
import {validateSignUp, validateResult} from '../middleware/validator.js';


// import { fileUpload } from '../middleware/fileUpload.js';

const router = express.Router();

router.get('/login',isGuest, controller.loginPage);

router.get('/signup',isGuest, controller.signupPage);

router.post('/',isGuest, validateSignUp, validateResult, controller.create);

router.post('/login',isGuest, validateResult, controller.login);

router.get('/logout',isLoggedIn, controller.logout);

export default router;