import { User } from '../models/User';
import { Request, Response, NextFunction } from 'express';
import '../config/passport';

/**
 * GET /chat/public/users
 * Get all users and their status in the public chatroom.
 */
export const getPublicUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.getAllUsers('username isOnline status');
    return res.status(200).json({ users });
  } catch (err) {
    next(err);
  }
};
