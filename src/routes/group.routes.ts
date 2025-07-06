import { Router } from 'express';
import { verifyJwt } from '../middlewares/auth.middleware';
import {
  createGroup,
  destroyGroup,
  fetchGroupDetails,
  fetchGroups,
  updateGroup,
} from '../controllers/group.controller';
const router = Router();

router.route('/').post(verifyJwt, createGroup);
router.route('/').get(verifyJwt, fetchGroups);
router.route('/:group_id').get(verifyJwt, fetchGroupDetails);
router.route('/:group_id').delete(verifyJwt, destroyGroup);
router.route('/:group_id').patch(verifyJwt, updateGroup);

export default router;
