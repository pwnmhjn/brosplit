import { Router } from 'express';
import { verifyJwt } from '../middlewares/auth.middleware';
import {
  addMember,
  createExpense,
  createGroup,
  destroyGroup,
  destroyGroupMember,
  fetchGroupDetails,
  fetchGroupMembers,
  fetchGroups,
  updateGroup,
  updateGroupMember,
} from '../controllers/group.controller';
const router = Router();

router.route('/').post(verifyJwt, createGroup);
router.route('/').get(verifyJwt, fetchGroups);
router.route('/:group_id').get(verifyJwt, fetchGroupDetails);
router.route('/:group_id').delete(verifyJwt, destroyGroup);
router.route('/:group_id').patch(verifyJwt, updateGroup);
router.route('/:group_id/members').post(verifyJwt, addMember);
router.route('/:group_id/members').get(verifyJwt, fetchGroupMembers);
router
  .route('/:group_id/members/:member_id')
  .patch(verifyJwt, updateGroupMember);
router
  .route('/:group_id/members/:member_id')
  .delete(verifyJwt, destroyGroupMember);
router.route('/:group_id/expense').post(verifyJwt, createExpense);

export default router;
