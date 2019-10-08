import { User } from '../models/User';
import { Request, Response, NextFunction } from 'express';
import '../config/passport';

/**
 * GET /chat/public/users
 * Get all users and their status in the public chatroom.
 */
export const getPublicUsers = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  User.find({}, function(err, users) {
    if (err) {
      return next(err);
    }

    return res.status(200).json({ users });
  });
};
