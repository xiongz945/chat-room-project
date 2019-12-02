import passport from 'passport';
import passportLocal from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import _ from 'lodash';
import { JWT_SECRET } from '../config/secrets';

// import { User, UserType } from '../models/User';
import { User, IUserDocument } from '../models/User';
import { Request, Response, NextFunction } from 'express';

const LocalStrategy = passportLocal.Strategy;

passport.serializeUser<any, any>((user, done) => {
  done(undefined, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

/**
 * Sign in using username and Password.
 */
passport.use(
  new LocalStrategy(
    { usernameField: 'username' },
    (username, password, done) => {
      User.findOne({ username: username.toLowerCase() }, (err, user: any) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(undefined, false, {
            message: `Username ${username} not found.`,
          });
        }
        user
          .comparePassword(password)
          .then((isMatch: boolean) => {
            if (isMatch) {
              return done(undefined, user);
            }
            return done(undefined, false, {
              message: 'Invalid email or password',
            });
          })
          .catch((err: Error) => {
            return done(err);
          });
      });
    }
  )
);

/**
 * Authentacate using JWT
 */
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    function(jwtPayload, cb) {
      //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
      return User.findOne(
        { username: jwtPayload.username },
        (err, user: any) => {
          if (err) {
            return cb(err, false);
          }
          if (!user) {
            return cb(null, false);
          }
          return cb(null, user);
        }
      );
    }
  )
);

/**
 * Login Required middleware.
 */
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ err: 'You are not authenticated.' });
};

export const isLegalAnnouncement = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const reqUser = req.user as IUserDocument;
  if (reqUser.role === 'coordinator' || reqUser.role === 'administrator') {
    return next();
  } else return res.status(401).json({ err: 'You are not authorized.' });
};

export const isLegalStatusCheck = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const reqUser = req.user as IUserDocument;
  if (reqUser.role === 'administrator') {
    return next();
  } else
    return res.status(401).json({ err: 'You are not authorized to do so.' });
};
