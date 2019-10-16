import { IUserDocument, User } from '../models/User';
import { Request, Response, NextFunction } from 'express';
import { check, validationResult } from 'express-validator';
import '../config/passport';

/**
 * GET /user/me/profile
 * Retrieve profile information.
 */
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reqUser = req.user as IUserDocument;
    const user: IUserDocument = await User.findById(reqUser.id).exec();

    return res.status(200).json({ userProfile: user.profile });
  } catch (err) {
    return next(err);
  }
};

/**
 * PATCH /user/me/status
 * Update user status
 */
export const patchUpdateStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as IUserDocument;
  try {
    await user.setStatus(req.body.status);
    return res
      .status(200)
      .json({ message: 'success', status: req.body.status });
  } catch (err) {
    return res.status(500).json({ err });
  }
};

/**
 * PATCH /user/me/online
 * Update user online status
 */
export const patchUpdateIsOnline = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as IUserDocument;
  try {
    await user.setIsOnline(req.body.isOnline);
    return res
      .status(200)
      .json({ message: 'success', isOnline: req.body.isOnline });
  } catch (err) {
    return res.status(500).json({ err });
  }
};

/**
 * PATCH /user/me/profile
 * Update profile information.
 */
export const patchUpdateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reqUser = req.user as IUserDocument;
    const user: IUserDocument = await User.findById(reqUser.id).exec();

    user.username = req.body.username || user.username;
    user.profile.name = req.body.name || user.profile.name;
    user.profile.gender = req.body.gender || user.profile.gender;
    user.profile.location = req.body.location || user.profile.location;
    user.profile.phone = req.body.phone || user.profile.phone;

    await user.save();
    return res.status(200).json({
      message: 'success',
      userProfile: user.profile.toObject(),
      username: user.username,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        err:
          'The username you have entered is already associated with an account.',
      });
    }
    return res.status(500).json({ err });
  }
};

/**
 * PATCH /user/me/password
 * Update current password.
 */
export const patchUpdatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  check('password', 'Password must be at least 4 characters long').isLength({
    min: 4,
  });
  check('confirmPassword', 'Passwords do not match').equals(req.body.password);

  const errors = validationResult(req);

  if (!errors.isEmpty()) return res.status(400).json({ err: errors.array() });

  try {
    const reqUser = req.user as IUserDocument;
    const user: IUserDocument = await User.findById(reqUser.id).exec();
    user.password = req.body.password;

    await user.save();
    return res.status(200).json({ message: 'success' });
  } catch (err) {
    return next(err);
  }
};
