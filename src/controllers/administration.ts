import bcrypt from 'bcrypt-nodejs';
import mongoose from 'mongoose';
import { IUserDocument, User } from '../models/User';
import { NextFunction, Request, Response } from 'express';

/**
 * GET /user/me/profile
 * Retrieve profile information.
 */

export interface IGetUserProfileRequest extends Request {
  user: IUserDocument;
}

export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user.role != 'administrator') {
      return res.status(401).json({ err: 'Unauthorized' });
    }
    const users: IUserDocument[] = await User.getAllUsers(
      'username role active'
    );
    return res.status(200).json({'users': users});
  } catch (err) {
    return next(err);
  }
};

export const updateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user.role != 'administrator') {
      return res.status(401).json({ err: 'Unauthorized' });
    }
    const payload = req.body;
    const userID = payload['user_id'];
    const user = payload['user'];
    await hashUserPassword(user);
    await User.updateOne({ _id: userID }, user);
    return res.status(200).json({});
  } catch (err) {
    return next(err);
  }
};

const hashUserPassword = async (user: any) => {
  if ('password' in user) {
    const plainPassword = user['password'];
    const salt: string = await new Promise((resolve, reject) => {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) reject(err);
        resolve(salt);
      });
    });
    user['password'] = await new Promise((resolve, reject) => {
      bcrypt.hash(
        plainPassword,
        salt,
        undefined,
        (err: mongoose.Error, hash) => {
          if (err) reject(err);
          resolve(hash);
        }
      );
    });
  }
};
