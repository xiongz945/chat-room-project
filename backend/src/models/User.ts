import bcrypt from 'bcrypt-nodejs';
import crypto from 'crypto';
import mongoose, { Model } from 'mongoose';

type comparePasswordFunction = (
  candidatePassword: string,
  cb: (err: any, isMatch: any) => {}
) => void;

export interface UserDocument extends mongoose.Document {
  username: string;
  email: string;
  password: string;
  passwordResetToken: string;
  passwordResetExpires: Date;
  isOnline: boolean;
  status: string;

  profile: {
    name: string;
    nickName: string;
    gender: string;
    location: string;
    website: string;
    picture: string;
  };
}

export interface IUser extends UserDocument {
  comparePassword: comparePasswordFunction;
  gravatar: (size: number) => string;
}

export interface IUserModel extends Model<IUser> {
  findUserByName(
    username: string,
    callback: (err: any, existingUser: any) => void
  ): void;
  createNewUser(
      doc: any,
      callback: (err: Error, newUser: IUser) => void
  ): void;
}

const userSchema = new mongoose.Schema(
  {
    username: String,
    email: { type: String },
    password: String,
    passwordResetToken: String,
    passwordResetExpires: Date,

    isOnline: { type: Boolean, default: false },
    status: String,

    profile: {
      name: String,
      nickName: String,
      gender: String,
      location: String,
      website: String,
      picture: String,
    },
  },
  { timestamps: true }
);

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
  const user = this as UserDocument;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, undefined, (err: mongoose.Error, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

const comparePassword: comparePasswordFunction = function(
  candidatePassword,
  cb
) {
  bcrypt.compare(
    candidatePassword,
    this.password,
    (err: mongoose.Error, isMatch: boolean) => {
      cb(err, isMatch);
    }
  );
};

userSchema.methods.comparePassword = comparePassword;

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function(size: number = 200) {
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto
    .createHash('md5')
    .update(this.email)
    .digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

userSchema.methods.setIs

userSchema.statics.findUserByName = function findUserByName(
  username: string,
  callback: any
) {
  User.findOne({ username: username }, function(err, existingUser) {
    return callback(err, existingUser);
  });
};

userSchema.statics.createNewUser = function createNewUser(doc: any, callback: any) {
  const user = new User(doc);
  user.save((err, newUser) => {
    return callback(err, newUser);
  });
};

export const User: IUserModel = mongoose.model<IUser, IUserModel>(
  'User',
  userSchema
);
