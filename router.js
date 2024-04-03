import express from 'express';
import auth from './routes/AuthRoutes.js';
import chart from './routes/ChartRoutes.js';
import signup from './routes/SignupRoutes.js';

const router = express.Router();

router.use('/auth', auth)
router.use('/chart', chart)
router.use('/signup', signup)


export default router;