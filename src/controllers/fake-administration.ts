import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Message } from '../models/Message';

export const patchUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findUserById(req.body.id);
    const oldUserName = user.username;
    const newUserName = req.body.username;

    User.updateUserInfo(
      oldUserName,
      newUserName,
      req.body.password,
      JSON.parse(req.body.active),
      req.body.role
    );

    Message.updateMessages(oldUserName, newUserName);

    return res.status(200).json({});
  } catch (err) {
    return next(err);
  }
};
