import { upload } from './../middlewares/multer.middleware';
import { Router } from 'express';
import {
  createProfile,
  destroyProfile,
  getProfiles,
  updateProfile,
} from '../controllers/profile.controller';
import { verifyJwt } from '../middlewares/auth.middleware';

const router = Router();

router.route('/').post(verifyJwt, upload.single('avatar'), createProfile);
router.route('/').patch(verifyJwt, upload.single('avatar'), updateProfile);
router.route('/').get(verifyJwt, getProfiles);
router.route('/').delete(verifyJwt, destroyProfile);

export default router;
