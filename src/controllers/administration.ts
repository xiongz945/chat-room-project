import bcrypt from 'bcrypt-nodejs';
import mongoose from 'mongoose';
import { IUserDocument, User } from '../models/User';
import { Message } from '../models/Message';
import { Location } from '../models/Location';
import { EarthquakeReport } from '../models/EarthquakeReport';
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
    return res.status(200).json({ users: users });
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
    const userId = payload['user_id'];

    const oldUser = await User.findUserById(userId);
    const oldUsername = oldUser['username'];

    if (oldUsername === 'ESNAdmin') {
      return res
        .status(200)
        .json({ oldUsername: oldUsername, newUsername: oldUsername });
    }

    const newUser = payload['user'];
    const newUsername = newUser['username'];

    await hashUserPassword(newUser);
    await User.updateOne({ _id: userId }, newUser);

    Message.updateMessages(oldUsername, newUsername, newUser.active);
    Location.updateLocation(oldUsername, newUsername);
    EarthquakeReport.updateReport(oldUsername, newUsername);

    return res
      .status(200)
      .json({ oldUsername: oldUsername, newUsername: newUsername });
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
