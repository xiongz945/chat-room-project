import passport from 'passport';
import jwt from 'jsonwebtoken';
import { User, UserDocument } from '../models/User';
import { Request, Response, NextFunction } from 'express';
import { IVerifyOptions } from 'passport-local';
import { check, sanitize, validationResult } from 'express-validator';
import { JWT_SECRET } from '../config/secrets';
import '../config/passport';

/**
 * POST /auth/login
 * Sign in using email and password.
 */
export const postLogin = (req: Request, res: Response, next: NextFunction) => {
  check('email', 'Email is not valid').isEmail();
  check('password', 'Password cannot be blank').isLength({ min: 1 });
  sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash('errors', errors.array());
    return res.status(400).json({ err: errors.array() });
  }

  passport.authenticate(
    'local',
    { session: false },
    (err: Error, user: UserDocument, info: IVerifyOptions) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(400).json({ err: info.message });
      }
      req.logIn(user, { session: false }, (err) => {
        if (err) {
          return next(err);
        }
        const plainUserObject = {
          email: user.email,
          password: user.password,
          firstName: user.firstName,
          lastName: user.lastName,
        };
        const token = jwt.sign(plainUserObject, JWT_SECRET);
        return res.status(200).json({ user: plainUserObject, token });
      });
    }
  )(req, res, next);
};

/**
 * GET /auth/logout
 * Log out.
 */
export const logout = (req: Request, res: Response) => {
  req.logout();
  return res.status(200);
};

/**
 * POST /auth/signup
 * Create a new local account.
 */
export const postSignup = (req: Request, res: Response, next: NextFunction) => {
  check('firstName', 'First name cannot be blank').isLength({ min: 1 });
  check('lastName', 'Last name cannot be blank').isLength({ min: 1 });
  check('email', 'Email is not valid').isEmail();
  check('password', 'Password must be at least 4 characters long').isLength({
    min: 4,
  });
  sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ err: errors.array() });
  }

  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
  });

  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (err) {
      return next(err);
    }
    if (existingUser) {
      return res
        .status(400)
        .json({ err: 'Account with that email address already exists.' });
    }
    user.save((err) => {
      if (err) {
        return next(err);
      }
      req.logIn(user, { session: false }, (err) => {
        if (err) {
          return next(err);
        }
        const plainUserObject = {
          email: user.email,
          password: user.password,
          firstName: user.firstName,
          lastName: user.lastName,
        };
        const token = jwt.sign(plainUserObject, JWT_SECRET);
        return res.status(200).json({ user: plainUserObject, token });
      });
    });
  });
};
