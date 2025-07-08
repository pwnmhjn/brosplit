import { verifyJwt } from './../middlewares/auth.middleware';
import { Router } from 'express';

import {
  fetchCurrentUser,
  fetchUsers,
  getAccessToken,
  signIn,
  signOut,
  signUp,
} from '../controllers/auth.controller';

const router = Router();

router.route('/sign-up').post(signUp);
router.route('/sign-in').post(signIn);
router.route('/sign-out').get(verifyJwt, signOut);
router.route('/').get(verifyJwt, fetchUsers);
router.route('/current-user').get(verifyJwt, fetchCurrentUser);
router.route('/get-Access').get(verifyJwt, getAccessToken);

export default router;
