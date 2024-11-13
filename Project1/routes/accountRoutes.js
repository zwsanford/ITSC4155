import express from 'express';
import controller from '../controllers/accountController.js';
import { fileUpload } from '../middleware/fileUpload.js';

const router = express.Router();

router.get('/login', controller.login);

router.get('/signup', controller.signup);

router.post('/', controller.create);

router.post('/check', controller.logged);

export default router;