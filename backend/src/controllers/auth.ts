import passport from 'passport';
import jwt from 'jsonwebtoken';
import { User, UserDocument } from '../models/User';
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

/**
 * POST /login
 * Login or create a new account.
 */
export const postLogin = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errMsgs: any[] = [];
    errors.array().forEach((element) => {
      errMsgs.push(element.msg);
    });
    return res.status(400).json({ message: errMsgs });
  }

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
        const user = new User({
          username: req.body.username,
          password: req.body.password,
          status: 'logged out',
        });

        user.save((err) => {
          if (err) {
            return next(err);
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
 * GET /auth/logout
 * Log out.
 */
export const logout = (req: Request, res: Response) => {
  User.updateOne(
    { username: req.user.username },
    { status: 'logged out' },
    (err, raw) => {
      if (err) {
        return res.status(500).json('logout failed');
      }
      req.logout();
      return res.status(200).json('logout success');
    }
  );
};
