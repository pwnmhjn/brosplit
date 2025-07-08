import { Router } from 'express';
import {
  fetchExpenseSplit,
  updateExpenseSplit,
} from '../controllers/expense.controller';
import { verifyJwt } from '../middlewares/auth.middleware';

const router = Router();

router.route('/:expense_id/split').get(verifyJwt, fetchExpenseSplit);
router
  .route('/:expense_id/split/:split_id')
  .patch(verifyJwt, updateExpenseSplit);

export default router;
