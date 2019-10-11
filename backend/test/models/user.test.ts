import mongoose from 'mongoose';

import { IUserDocument, User } from '../../src/models/User';
import { MONGODB_URI, SESSION_SECRET } from '../../src/config/secrets';

describe('Test User Model', () => {
  let user: IUserDocument;
  beforeAll(async () => {
    mongoose
      .connect(MONGODB_URI, { useNewUrlParser: true })
      .then(() => {})
      .catch((err) => {
        console.log(err);
      });

    user = new User({ username: '123', password: '123' });
    await user.save();
  });

  afterAll(async () => {
    await User.deleteOne({ username: '123' });
  });

  describe('test findUserByName()', () => {
    test('findUserByName() can find an exsiting user', async () => {
      const existingUser = await User.findUserByName('123');
      expect(existingUser['username']).toBe('123');
    });

    test('findUserByName() can not find an non-existing user', async () => {
      const existingUser = await User.findUserByName('none');
      expect(existingUser).toBeNull();
    });
  });

  describe('test createNewUser()', () => {
    test('createNewUser() can create a new user', async () => {
      const newUser = await User.createNewUser({
        username: 'newuser',
        password: '123456',
      });
      expect(newUser.username).toBe('newuser');
    });

    afterAll(async () => {
      await User.deleteOne({ username: 'newuser' });
    });
  });

  describe('test setIsOnline()', () => {
    test('setIsOnline() can set user online', async () => {
      await user.setIsOnline(true);
      expect(user.isOnline).toBe(true);
    });
    test('setIsOnline() can set user offline', async () => {
      await user.setIsOnline(false);
      expect(user.isOnline).toBe(false);
    });
  });

  describe('test getAllUsers()', () => {
    beforeAll(async () => {
      await new User({ username: '456', password: '456' }).save();
      await new User({ username: '789', password: '789' }).save();
    });

    test('getAllUsers() can get all users in the collection', async () => {
      const users: IUserDocument[] = await User.getAllUsers('username');
      const createdUsernames = ['123', '456', '789'];
      expect(users.length).toBeGreaterThanOrEqual(3);
      let cnt = 0;
      users.forEach((value) => {
        if (createdUsernames.includes(value.username)) {
          ++cnt;
        }
      });
      expect(cnt).toBe(3);
    });

    afterAll(async () => {
      await User.deleteOne({ username: '456' });
      await User.deleteOne({ username: '789' });
    });
  });

  describe('test comparePassword()', () => {
    test('comparePassword() return true when the password is correct', async () => {
      const user = await User.findUserByName('123');
      const isMatch = await user.comparePassword('123');
      expect(isMatch).toBe(true);
    });

    test('comparePassword() return false when the password is not correct', async () => {
      const user = await User.findUserByName('123');
      const isMatch = await user.comparePassword('123123123123');
      expect(isMatch).toBe(false);
    });
  });
});
