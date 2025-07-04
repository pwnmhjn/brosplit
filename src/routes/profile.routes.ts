import { upload } from './../middlewares/multer.middleware';
import { Router } from 'express';
import {
  createProfile,
  updateProfile,
} from '../controllers/profile.controller';
import { verifyJwt } from '../middlewares/auth.middleware';

const router = Router();

router
  .route('/create-profile')
  .post(verifyJwt, upload.single('avatar'), createProfile);
router
  .route('/update-profile')
  .patch(verifyJwt, upload.single('avatar'), updateProfile);

export default router;
