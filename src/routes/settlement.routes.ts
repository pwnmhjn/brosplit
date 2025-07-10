import { Router } from 'express';
import { createSettlement } from '../controllers/settlement.controller';
import { verifyJwt } from '../middlewares/auth.middleware';

const router = Router();

router
  .route('/:group_id/expense/:expense_id/settlement')
  .post(verifyJwt, createSettlement);

export default router;
