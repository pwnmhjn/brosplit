import { Response } from 'express';
import { AuthenticatedRequest } from '../types/profile';
import { AsyncWrap } from '../utils/AsyncWrap';
import { ErrorResponse } from '../utils/ErrorResponse';
import { checkReqBody } from '../utils/checkReqBody';
import { CreateSettlementReqBody } from '../types/settlement';
import { Settlement } from '../models/settlementSchema';
import { SuccessResponse } from '../utils/SuccessResponse';

const createSettlement = AsyncWrap(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new ErrorResponse(401, 'User is not Authenticated');
    }
    const { group_id } = req.params;
    const { toUserId, note, amount, date } =
      req.body as CreateSettlementReqBody;
    const { isThere, missingKey } = checkReqBody({ toUserId, amount });
    if (!isThere) {
      throw new ErrorResponse(400, `Please Enter ${missingKey}`);
    }
    const settlementData = {
      groupId: group_id,
      fromUserId: req.user._id.toString(),
      amount: amount,
      toUserId: toUserId,
    } as CreateSettlementReqBody;
    if (note !== undefined) settlementData.note = note;
    if (date !== undefined) settlementData.date = date;
    const settlement = await Settlement.create(settlementData);
    if (!settlement) {
      throw new ErrorResponse(500, 'Unable to Create Settlement');
    }
    res
      .status(201)
      .json(
        new SuccessResponse(
          200,
          { settlement },
          'Settlement Creation Successful'
        )
      );
  }
);

export { createSettlement };
