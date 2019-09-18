
import { User, UserDocument } from '../models/User';
import { Request, Response, NextFunction } from 'express';
import { WriteError } from 'mongodb';
import { check, sanitize, validationResult } from 'express-validator';
import { JWT_SECRET } from '../config/secrets';
import '../config/passport';

import reservedUsernames from '../config/reservedUsernames.json';

/**
 * GET /logout
 * Log out.
 */
export const logout = (req: Request, res: Response) => {
  req.logout();
  return res.status(200);
};

/**
 * POST /login
 * Login or Create a new local account.
 */
export const postLogin = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errMsgs: any[] = [];
    errors.array().forEach(element => {
      errMsgs.push(element.msg);
    });
    return res.status(400).json({ message: errMsgs });
  }

  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  User.findOne({ username: req.body.username }, (err, existingUser) => {
    if (err) {
      return next(err);
    }
    if (existingUser) {
      passport.authenticate(
        'local',
        { session: false },
        (err: Error, user: UserDocument, info: IVerifyOptions) => {
          if (err) {
            return next(err);
          }
          if (!user) {
            return res.status(400).json({ message: ['invalid password'] });
          }
          req.logIn(user, { session: false }, (err) => {
            if (err) {
              return next(err);
            }
            const plainUserObject = {
              username: user.username,
              password: user.password,
            };
            const token = jwt.sign(plainUserObject, JWT_SECRET);
            return res.status(200).json({
              user: plainUserObject,
              token,
              message: ['authenticated'],
            });
          });
        }
      )(req, res, next);
    } else {
      if (req.body.confirm == true) {
        user.save((err) => {
          if (err) {
            return next(err);
          }
          req.logIn(user, { session: false }, (err) => {
            if (err) {
              return next(err);
            }
            const plainUserObject = {
              password: user.password,
              username: user.username,
            };
            const token = jwt.sign(plainUserObject, JWT_SECRET);
            return res.status(200).json({
              user: plainUserObject,
              token,
              message: ['registered'],
            });
          });
        });
      } else {
        return res.status(400).json({ message: ['non-existing username'] });
      }
    }
  });
};
      
/**
 * POST /user/profile
 * Update profile information.
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
 * POST /user/profile
 * Update profile information.
 */
export const postUpdateProfile = (
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
          return res
            .status(400)
            .json({
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
 * POST /user/password
 * Update current password.
 */
export const postUpdatePassword = (
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

export const usernameRule = check('username')
  .isLength({ min: 3 })
  .withMessage('invalid username length')
  .not()
  .isIn(reservedUsernames)
  .withMessage('reserved username');

export const passwordRule = check(
  'password',
  'invalid password length'
  ).isLength({
    min: 4,
  });
