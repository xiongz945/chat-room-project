import passport from 'passport';
import passportLocal from 'passport-local';
import passportFacebook from 'passport-facebook';
import _ from 'lodash';

// import { User, UserType } from '../models/User';
import { User } from '../models/User';
import { Request, Response, NextFunction } from 'express';

const LocalStrategy = passportLocal.Strategy;
const FacebookStrategy = passportFacebook.Strategy;

passport.serializeUser<any, any>((user, done) => {
  done(undefined, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

/**
 * Sign in using Email and Password.
 */
passport.use(
  new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    User.findOne({ email: email.toLowerCase() }, (err, user: any) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(undefined, false, { message: `Email ${email} not found.` });
      }
      user.comparePassword(password, (err: Error, isMatch: boolean) => {
        if (err) {
          return done(err);
        }
        if (isMatch) {
          return done(undefined, user);
        }
        return done(undefined, false, {
          message: 'Invalid email or password.',
        });
      });
    });
  })
);

/**
 * OAuth Strategy Overview
 *
 * - User is already logged in.
 *   - Check if there is an existing account with a provider id.
 *     - If there is, return an error message. (Account merging not supported)
 *     - Else link new OAuth account with currently logged-in user.
 * - User is not logged in.
 *   - Check if it's a returning user.
 *     - If returning user, sign in and we are done.
 *     - Else check if there is an existing account with user's email.
 *       - If there is, return an error message.
 *       - Else create a new account.
 */

/**
 * Sign in with Facebook.
 */
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
      callbackURL: '/auth/facebook/callback',
      profileFields: ['name', 'email', 'link', 'locale', 'timezone'],
      passReqToCallback: true,
    },
    (req: any, accessToken, refreshToken, profile, done) => {
      if (req.user) {
        User.findOne({ facebook: profile.id }, (err, existingUser) => {
          if (err) {
            return done(err);
          }
          if (existingUser) {
            req.flash('errors', {
              msg:
                'There is already a Facebook account that belongs to you. Sign in with that account or delete it, then link it with your current account.',
            });
            done(err);
          } else {
            User.findById(req.user.id, (err, user: any) => {
              if (err) {
                return done(err);
              }
              user.facebook = profile.id;
              user.tokens.push({ kind: 'facebook', accessToken });
              user.profile.name =
                user.profile.name ||
                `${profile.name.givenName} ${profile.name.familyName}`;
              user.profile.gender = user.profile.gender || profile._json.gender;
              user.profile.picture =
                user.profile.picture ||
                `https://graph.facebook.com/${profile.id}/picture?type=large`;
              user.save((err: Error) => {
                req.flash('info', { msg: 'Facebook account has been linked.' });
                done(err, user);
              });
            });
          }
        });
      } else {
        User.findOne({ facebook: profile.id }, (err, existingUser) => {
          if (err) {
            return done(err);
          }
          if (existingUser) {
            return done(undefined, existingUser);
          }
          User.findOne(
            { email: profile._json.email },
            (err, existingEmailUser) => {
              if (err) {
                return done(err);
              }
              if (existingEmailUser) {
                req.flash('errors', {
                  msg:
                    'There is already an account using this email address. Sign in to that account and link it with Facebook manually from Account Settings.',
                });
                done(err);
              } else {
                const user: any = new User();
                user.email = profile._json.email;
                user.facebook = profile.id;
                user.tokens.push({ kind: 'facebook', accessToken });
                user.profile.name = `${profile.name.givenName} ${profile.name.familyName}`;
                user.profile.gender = profile._json.gender;
                user.profile.picture = `https://graph.facebook.com/${profile.id}/picture?type=large`;
                user.profile.location = profile._json.location
                  ? profile._json.location.name
                  : '';
                user.save((err: Error) => {
                  done(err, user);
                });
              }
            }
          );
        });
      }
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
  res.redirect('/login');
};

/**
 * Authorization Required middleware.
 */
export const isAuthorized = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const provider = req.path.split('/').slice(-1)[0];

  if (_.find(req.user.tokens, { kind: provider })) {
    next();
  } else {
    res.redirect(`/auth/${provider}`);
  }
};
export const reservedUsernames = ['about', 'access', 'account', 'accounts', 'add', 'address', 'adm', 'admin', 'administration', 'adult', 'advertising', 'affiliate', 'affiliates', 'ajax', 'analytics', 'android', 'anon', 'anonymous', 'api', 'app', 'apps', 'archive', 'atom', 'auth', 'authentication', 'avatar', 'backup', 'banner', 'banners', 'bin', 'billing', 'blog', 'blogs', 'board', 'bot', 'bots', 'business', 'chat', 'cache', 'cadastro', 'calendar', 'campaign', 'careers', 'cgi', 'client', 'cliente', 'code', 'comercial', 'compare', 'config', 'connect', 'contact', 'contest', 'create', 'code', 'compras', 'css', 'dashboard', 'data', 'db', 'design', 'delete', 'demo', 'design', 'designer', 'dev', 'devel', 'dir', 'directory', 'doc', 'docs', 'domain', 'download', 'downloads', 'edit', 'editor', 'email', 'ecommerce', 'forum', 'forums', 'faq', 'favorite', 'feed', 'feedback', 'flog', 'follow', 'file', 'files', 'free', 'ftp', 'gadget', 'gadgets', 'games', 'guest', 'group', 'groups', 'help', 'home', 'homepage', 'host', 'hosting', 'hostname', 'html', 'http', 'httpd', 'https', 'hpg', 'info', 'information', 'image', 'img', 'images', 'imap', 'index', 'invite', 'intranet', 'indice', 'ipad', 'iphone', 'irc', 'java', 'javascript', 'job', 'jobs', 'js', 'knowledgebase', 'log', 'login', 'logs', 'logout', 'list', 'lists', 'mail', 'mail1', 'mail2', 'mail3', 'mail4', 'mail5', 'mailer', 'mailing', 'mx', 'manager', 'marketing', 'master', 'me', 'media', 'message', 'microblog', 'microblogs', 'mine', 'mp3', 'msg', 'msn', 'mysql', 'messenger', 'mob', 'mobile', 'movie', 'movies', 'music', 'musicas', 'my', 'name', 'named', 'net', 'network', 'new', 'news', 'newsletter', 'nick', 'nickname', 'notes', 'noticias', 'ns', 'ns1', 'ns2', 'ns3', 'ns4', 'old', 'online', 'operator', 'order', 'orders', 'page', 'pager', 'pages', 'panel', 'password', 'perl', 'pic', 'pics', 'photo', 'photos', 'photoalbum', 'php', 'plugin', 'plugins', 'pop', 'pop3', 'post', 'postmaster', 'postfix', 'posts', 'profile', 'project', 'projects', 'promo', 'pub', 'public', 'python', 'random', 'register', 'registration', 'root', 'ruby', 'rss', 'sale', 'sales', 'sample', 'samples', 'script', 'scripts', 'secure', 'send', 'service', 'shop', 'sql', 'signup', 'signin', 'search', 'security', 'settings', 'setting', 'setup', 'site', 'sites', 'sitemap', 'smtp', 'soporte', 'ssh', 'stage', 'staging', 'start', 'subscribe', 'subdomain', 'suporte', 'support', 'stat', 'static', 'stats', 'status', 'store', 'stores', 'system', 'tablet', 'tablets', 'tech', 'telnet', 'test', 'test1', 'test2', 'test3', 'teste', 'tests', 'theme', 'themes', 'tmp', 'todo', 'task', 'tasks', 'tools', 'tv', 'talk', 'update', 'upload', 'url', 'user', 'username', 'usuario', 'usage', 'vendas', 'video', 'videos', 'visitor', 'win', 'ww', 'www', 'www1', 'www2', 'www3', 'www4', 'www5', 'www6', 'www7', 'wwww', 'wws', 'wwws', 'web', 'webmail', 'website', 'websites', 'webmaster', 'workshop', 'xxx', 'xpg', 'you', 'yourname', 'yourusername', 'yoursite', 'yourdomain'];
