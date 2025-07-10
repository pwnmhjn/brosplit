import { verifyJwt } from './../middlewares/auth.middleware';
import { Router } from 'express';
import { fetchUserSplits } from '../controllers/split.controller';

const router = Router();

router.route('/splits').get(verifyJwt,fetchUserSplits);

export default router
