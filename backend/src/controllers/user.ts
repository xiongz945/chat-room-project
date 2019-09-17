import async from 'async';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { User, UserDocument, AuthToken } from '../models/User';
import { Request, Response, NextFunction } from 'express';
import { IVerifyOptions } from 'passport-local';
import { WriteError } from 'mongodb';
import { check, sanitize, validationResult } from 'express-validator';
import { JWT_SECRET } from '../config/secrets';
import '../config/passport';

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
    return res.status(400).json({ err: errors.array() });
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
            return res.status(400).json({status: 'invalid password'});
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
              user: plainUserObject, token,
              status: 'authenticated'
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
              username: user.username
            };
            const token = jwt.sign(plainUserObject, JWT_SECRET);
            return res.status(200).json({
              user: plainUserObject, token,
              status: 'registered'
            });
          });
        });
      } else {
        return res.json({status: 'invalid user'});
      }
    }
  });
};

/**
 * POST /account/profile
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
    req.flash('errors', errors.array());
    return res.redirect('/account');
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
          req.flash('errors', {
            msg:
              'The email address you have entered is already associated with an account.',
          });
          return res.redirect('/account');
        }
        return next(err);
      }
      req.flash('success', { msg: 'Profile information has been updated.' });
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/password
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
 * POST /account/delete
 * Delete user account.
 */
export const postDeleteAccount = (
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

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 */
export const getOauthUnlink = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const provider = req.params.provider;
  User.findById(req.user.id, (err, user: any) => {
    if (err) {
      return next(err);
    }
    user[provider] = undefined;
    user.tokens = user.tokens.filter(
      (token: AuthToken) => token.kind !== provider
    );
    user.save((err: WriteError) => {
      if (err) {
        return next(err);
      }
      req.flash('info', { msg: `${provider} account has been unlinked.` });
      res.redirect('/account');
    });
  });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
export const postReset = (req: Request, res: Response, next: NextFunction) => {
  check('password', 'Password must be at least 4 characters long.').isLength({
    min: 4,
  });
  check('confirm', 'Passwords must match.').equals(req.body.password);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash('errors', errors.array());
    return res.redirect('back');
  }

  async.waterfall(
    [
      function resetPassword(done: Function) {
        User.findOne({ passwordResetToken: req.params.token })
          .where('passwordResetExpires')
          .gt(Date.now())
          .exec((err, user: any) => {
            if (err) {
              return next(err);
            }
            if (!user) {
              req.flash('errors', {
                msg: 'Password reset token is invalid or has expired.',
              });
              return res.redirect('back');
            }
            user.password = req.body.password;
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            user.save((err: WriteError) => {
              if (err) {
                return next(err);
              }
              req.logIn(user, (err) => {
                done(err, user);
              });
            });
          });
      },
      function sendResetPasswordEmail(user: UserDocument, done: Function) {
        const transporter = nodemailer.createTransport({
          service: 'SendGrid',
          auth: {
            user: process.env.SENDGRID_USER,
            pass: process.env.SENDGRID_PASSWORD,
          },
        });
        const mailOptions = {
          to: user.email,
          from: 'express-ts@starter.com',
          subject: 'Your password has been changed',
          text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`,
        };
        transporter.sendMail(mailOptions, (err) => {
          req.flash('success', {
            msg: 'Success! Your password has been changed.',
          });
          done(err);
        });
      },
    ],
    (err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    }
  );
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
export const postForgot = (req: Request, res: Response, next: NextFunction) => {
  check('email', 'Please enter a valid email address.').isEmail();
  sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash('errors', errors.array());
    return res.redirect('/forgot');
  }

  async.waterfall(
    [
      function createRandomToken(done: Function) {
        crypto.randomBytes(16, (err, buf) => {
          const token = buf.toString('hex');
          done(err, token);
        });
      },
      function setRandomToken(token: AuthToken, done: Function) {
        User.findOne({ email: req.body.email }, (err, user: any) => {
          if (err) {
            return done(err);
          }
          if (!user) {
            req.flash('errors', {
              msg: 'Account with that email address does not exist.',
            });
            return res.redirect('/forgot');
          }
          user.passwordResetToken = token;
          user.passwordResetExpires = Date.now() + 3600000; // 1 hour
          user.save((err: WriteError) => {
            done(err, token, user);
          });
        });
      },
      function sendForgotPasswordEmail(
        token: AuthToken,
        user: UserDocument,
        done: Function
      ) {
        const transporter = nodemailer.createTransport({
          service: 'SendGrid',
          auth: {
            user: process.env.SENDGRID_USER,
            pass: process.env.SENDGRID_PASSWORD,
          },
        });
        const mailOptions = {
          to: user.email,
          from: 'hackathon@starter.com',
          subject: 'Reset your password on Hackathon Starter',
          text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://${req.headers.host}/reset/${token}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };
        transporter.sendMail(mailOptions, (err) => {
          req.flash('info', {
            msg: `An e-mail has been sent to ${user.email} with further instructions.`,
          });
          done(err);
        });
      },
    ],
    (err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/forgot');
    }
  );
};

// export const emailRule = check('email', 'Email is not valid').isEmail();
// export const usernameRule =
// check('username').isLength({min: 3,}).withMessage(
//     'Usernames must be at least 3 characters long.'
//     ).not().isIn(reservedUsernames).withMessage(
//       'This username is reserved'
//     );
// export const passwordRule =
//   check('password', 'Password must be at least 4 characters long').isLength({
//     min: 4,
//   });
