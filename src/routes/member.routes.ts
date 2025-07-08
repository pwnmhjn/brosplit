import { Router } from 'express';
import { verifyJwt } from '../middlewares/auth.middleware';
import {
  addMember,
  destroyGroupMember,
  fetchGroupMembers,
  updateGroupMember,
} from '../controllers/member.controller';
const router = Router();

router.route('/:group_id/members').post(verifyJwt, addMember);
router.route('/:group_id/members').get(verifyJwt, fetchGroupMembers);
router
  .route('/:group_id/members/:member_id')
  .patch(verifyJwt, updateGroupMember);
router
  .route('/:group_id/members/:member_id')
  .delete(verifyJwt, destroyGroupMember);

export default router;
