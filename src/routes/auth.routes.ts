import { verifyJwt } from './../middlewares/auth.middleware';
import { Router } from 'express';

import { signin, signout, signup } from '../controllers/auth.controller';

const router = Router();

router.route('/sign-up').post(signup);
router.route('/sign-in').post(signin);
router.route('/sign-out').get(verifyJwt, signout);

export default router;
