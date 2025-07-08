import { Router } from 'express';
import { verifyJwt } from '../middlewares/auth.middleware';
import {
  addMember,
  createExpense,
  createGroup,
  destroyGroup,
  destroyGroupExpense,
  destroyGroupMember,
  fetchGroupDetails,
  fetchGroupExpense,
  fetchGroupExpenseDetails,
  fetchGroupMembers,
  fetchGroups,
  updateGroup,
  updateGroupExpense,
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
router.route('/:group_id/expense').get(verifyJwt, fetchGroupExpense);
router
  .route('/:group_id/expense/:expense_id')
  .get(verifyJwt, fetchGroupExpenseDetails);
router
  .route('/:group_id/expense/:expense_id')
  .patch(verifyJwt, updateGroupExpense);
router
  .route('/:group_id/expense/:expense_id')
  .delete(verifyJwt, destroyGroupExpense);

export default router;
