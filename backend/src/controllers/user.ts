import { User, UserDocument } from '../models/User';
import { Request, Response, NextFunction } from 'express';
import { WriteError } from 'mongodb';
import { check, sanitize, validationResult } from 'express-validator';
import '../config/passport';

/**
 * GET /user/profile
 * Retrieve profile information.
 */
export const getProfile = (req: Request, res: Response, next: NextFunction) => {
  User.findById(req.user.id, (err, user: UserDocument) => {
    if (err) {
      return next(err);
    }

    return res.status(200).json({ userProfile: user.profile });
  });
};

/**
 * PATCH /user/profile
 * Update profile information.
 */
export const patchUpdateProfile = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  check('email', 'Please enter a valid email address.').isEmail();
  sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ err: errors.array() });
  }

  User.findById(req.user.id, (err, user: UserDocument) => {
    if (err) {
      return next(err);
    }
    user.email = req.body.email || '';
    user.profile.name = req.body.name || '';
    user.profile.gender = req.body.gender || '';
    user.profile.location = req.body.location || '';
    user.profile.website = req.body.website || '';
    user.save((err: WriteError) => {
      if (err) {
        if (err.code === 11000) {
          return res.status(400).json({
            err:
              'The email address you have entered is already associated with an account.',
          });
        }
        return next(err);
      }
      return res.status(200).json({ userProfile: user.profile });
    });
  });
};

/**
 * PATCH /user/password
 * Update current password.
 */
export const patchUpdatePassword = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  check('password', 'Password must be at least 4 characters long').isLength({
    min: 4,
  });
  check('confirmPassword', 'Passwords do not match').equals(req.body.password);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash('errors', errors.array());
    return res.redirect('/account');
  }

  User.findById(req.user.id, (err, user: UserDocument) => {
    if (err) {
      return next(err);
    }
    user.password = req.body.password;
    user.save((err: WriteError) => {
      if (err) {
        return next(err);
      }
      req.flash('success', { msg: 'Password has been changed.' });
      res.redirect('/account');
    });
  });
};

/**
 * DELETE /user/delete
 * Delete user account.
 */
export const deleteAccount = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  User.remove({ _id: req.user.id }, (err) => {
    if (err) {
      return next(err);
    }
    req.logout();
    req.flash('info', { msg: 'Your account has been deleted.' });
    res.redirect('/');
  });
};
