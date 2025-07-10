import { Response } from 'express';
import { AuthenticatedRequest } from '../types/profile';
import { AsyncWrap } from '../utils/AsyncWrap';
import { ErrorResponse } from '../utils/ErrorResponse';
import { ExpenseSplit } from '../models/expenseSplitSchema';
import { SuccessResponse } from '../utils/SuccessResponse';
// import mongoose from 'mongoose';

const fetchUserSplits = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new ErrorResponse(401, 'User is not Authenticated');
    }
    const splits = await ExpenseSplit.find({ userId: req.user._id });
    /*  const splits = await ExpenseSplit.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user._id) } },
    ]); */
    /*   console.log(splits); */
    if (!splits || splits.length < 0) {
      throw new ErrorResponse(404, 'Splits not Found');
    }
    res
      .status(200)
      .json(new SuccessResponse(200, { splits }, 'Users Splits Fetched'));
  }
);

export { fetchUserSplits };
