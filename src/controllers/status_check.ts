import { Request, Response, NextFunction } from 'express';
import { User, IUserDocument } from '../models/User';
import { StatusCheck } from '../models/StatusCheck';

export interface IPostMessageRequest extends Request {
  message: string;
  senderName: string;
  senderId: string;
  status: string;
}

export interface IGetMessageRequest extends Request {
  timestamp: number;
}

export const patchStatusCheck = async (
  req: IPostMessageRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user as IUserDocument;

    const statusCheck: any = (await StatusCheck.find({})
      .sort({ createdAt: -1 })
      .limit(1)
      .exec())[0];

    console.log(statusCheck);

    statusCheck.userResponses.push({
      username: user.username,
      status: req.body.status,
    });

    await statusCheck.save();
    await user.setStatus(req.body.status);

    // Create status check instance
    return res.status(200).json({ userStatus: req.body.status });
  } catch (err) {
    next(err);
  }
};

export const postStatusCheck = async (
  req: IPostMessageRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Create status check instance
    const status_check = new StatusCheck({ userResponses: [] });
    await status_check.save();

    return res.status(200).json('{}');
  } catch (err) {
    next(err);
  }
};

export const getStatusCheck = async (
  req: IGetMessageRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const statusCheck: any = await StatusCheck.find({}).exec();

    return res.status(200).json({ statusCheck });
  } catch (err) {
    return next(err);
  }
};
