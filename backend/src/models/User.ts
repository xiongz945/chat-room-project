import bcrypt from 'bcrypt-nodejs';
import crypto from 'crypto';
import mongoose, { Model } from 'mongoose';

type comparePasswordFunction = (
  candidatePassword: string,
  cb: (err: any, isMatch: any) => {}
) => void;

export interface IUserDocument extends mongoose.Document {
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
  comparePassword: comparePasswordFunction;
  setIsOnline: (
    isLogin: boolean,
    callback: (err: Error, raw: any) => void
  ) => void;
}

export interface IUserModel extends Model<IUserDocument> {
  findUserByName(
    username: string,
    callback: (err: any, existingUser: any) => void
  ): void;
  createNewUser(
    doc: any,
    callback: (err: Error, newUser: IUserDocument) => void
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
  const user = this as IUserDocument;
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

userSchema.statics.findUserByName = function findUserByName(
  username: string,
  callback: any
) {
  User.findOne({ username: username }, function(err, existingUser) {
    return callback(err, existingUser);
  });
};

userSchema.statics.createNewUser = function createNewUser(
  doc: any,
  callback: any
) {
  const user = new User(doc);
  user.save((err, newUser) => {
    return callback(err, newUser);
  });
};

userSchema.methods.setIsOnline = function setIsOnline(
  isOnline: boolean,
  callback: any
) {
  const user = this as IUserDocument;
  user.updateOne({ isOnline: isOnline }, (err, raw) => {
    callback(err, raw);
  });
};

export const User: IUserModel = mongoose.model<IUserDocument, IUserModel>(
  'User',
  userSchema
);
