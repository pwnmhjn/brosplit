import { Router } from 'express';
import { verifyJwt } from '../middlewares/auth.middleware';
import {
  createExpense,
  createGroup,
  destroyGroup,
  destroyGroupExpense,
  fetchGroupDetails,
  fetchGroupExpense,
  fetchGroupExpenseDetails,
  fetchGroupExpenseSplits,
  fetchGroups,
  updateGroup,
  updateGroupExpense,
} from '../controllers/group.controller';
const router = Router();

router.route('/').post(verifyJwt, createGroup);
router.route('/').get(verifyJwt, fetchGroups);
router.route('/:group_id').get(verifyJwt, fetchGroupDetails);
router.route('/:group_id').delete(verifyJwt, destroyGroup);
router.route('/:group_id').patch(verifyJwt, updateGroup);
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
router.route('/:group_id/splits').get(verifyJwt, fetchGroupExpenseSplits);

export default router;
