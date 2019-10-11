import { IUserDocument, User } from '../models/User';
import { Request, Response, NextFunction } from 'express';
import { WriteError } from 'mongodb';
import { check, sanitize, validationResult } from 'express-validator';
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
    const user: any = await User.findById(req.user.id).exec();
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
  try {
    await User.updateOne(
      { username: req.user.username },
      { status: req.body.status }
    ).exec();
    return res
      .status(200)
      .json({ message: 'success', userStatus: req.body.status });
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
  check('email', 'Please enter a valid email address.').isEmail();
  sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = validationResult(req);

  if (!errors.isEmpty()) return res.status(400).json({ err: errors.array() });

  try {
    const user: any = await User.findById(req.user.id);

    user.email = req.body.email || '';
    user.profile.name = req.body.name || '';
    user.profile.gender = req.body.gender || '';
    user.profile.location = req.body.location || '';
    user.profile.website = req.body.website || '';

    await user.save();
    return res.status(200).json({ userProfile: user.profile });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        err:
          'The email address you have entered is already associated with an account.',
      });
    }
    return next(err);
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
    const user: any = await User.findById(req.user.id);
    user.password = req.body.password;

    await user.save();
    return res.status(200).json({ message: 'success' });
  } catch (err) {
    return next(err);
  }
};

/**
 * DELETE /user/me/delete
 * Delete user account.
 */
export const deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await User.remove({ _id: req.user.id });
  req.logout();
  return res.status(200).json({ message: 'Your account has been deleted.' });
};
