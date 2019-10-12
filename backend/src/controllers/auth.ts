import passport from 'passport';
import jwt from 'jsonwebtoken';
import { User, IUserDocument } from '../models/User';
import { Request, Response, NextFunction } from 'express';
import { IVerifyOptions } from 'passport-local';
import { check, sanitize, validationResult } from 'express-validator';
import { JWT_SECRET } from '../config/secrets';
import reservedUsernames from '../config/reservedUsernames.json';
import '../config/passport';

/**
 * Middleware for username and password
 */
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

const serveExistingUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    'local',
    { session: false },
    (err: Error, user: IUserDocument, info: IVerifyOptions) => {
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
};

const serveNonExistingUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.body.confirm == true) {
    try {
      const newUser = await User.createNewUser({
        username: req.body.username,
        password: req.body.password,
      });

      req.logIn(newUser, { session: false }, (err) => {
        if (err) {
          return next(err);
        }
        const plainUserObject = {
          username: newUser.username,
          password: newUser.password,
        };
        const token = jwt.sign(plainUserObject, JWT_SECRET);
        return res.status(200).json({
          user: plainUserObject,
          token,
          message: ['registered'],
        });
      });
    } catch (err) {
      return next(err);
    }
  } else {
    return res.status(400).json({ message: ['non-existing username'] });
  }
};

/**
 * POST /login
 * Login or create a new account.
 */
export const postLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errMsgs: any[] = [];
    errors.array().forEach((element) => {
      errMsgs.push(element.msg);
    });
    return res.status(400).json({ message: errMsgs });
  }
  try {
    const existingUser = await User.findUserByName(req.body.username);
    if (existingUser) {
      return await serveExistingUser(req, res, next);
    } else {
      return await serveNonExistingUser(req, res, next);
    }
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /auth/logout
 * Log out.
 */
export const getLogout = async (req: Request, res: Response) => {
  const user = req.user as IUserDocument;
  try {
    await user.setIsOnline(false);
    req.logout();
    return res.status(200).json({ message: 'logout success' });
  } catch (err) {
    return res.status(500).json({ message: 'logout failed' });
  }
};
