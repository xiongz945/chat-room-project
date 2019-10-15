import mongoose from 'mongoose';

import { IUserDocument, User } from '../../src/models/User';
import { MONGODB_URI, SESSION_SECRET } from '../../src/config/secrets';

describe('Test User Model', () => {
  let user: IUserDocument;
  const MONGODB_URI_TEST = MONGODB_URI + '_user_model';
  beforeAll(async () => {
    mongoose
      .connect(MONGODB_URI_TEST, {
        useNewUrlParser: true,
      })
      .then(() => {})
      .catch((err) => {
        console.log(err);
      });

    user = new User({ username: '123', password: '123' });
    await user.save();
    await new User({ username: '456', password: '456' }).save();
    await new User({ username: '789', password: '789' }).save();
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  test('findUserByName() - Can find an existing user', async () => {
    const existingUser = await User.findUserByName('123');
    expect(existingUser['username']).toBe('123');
  });

  test('findUserByName() - Can not find an non-existing user', async () => {
    const existingUser = await User.findUserByName('none');
    expect(existingUser).toBeNull();
  });

  test('createNewUser() - Can create a new user', async () => {
    const newUser = await User.createNewUser({
      username: 'newuser',
      password: '123456',
    });
    expect(newUser.username).toBe('newuser');
  });

  test('createNewUser() - Can not create a existing user', async () => {
    try {
      await User.createNewUser({
        username: '123',
        password: '123',
      });
      fail('The duplicate key error can not be thrown');
    } catch (err) {
      expect(err.message.startsWith('E11000')).toBe(true);
    }
  });

  test('setIsOnline() - Can set user online', async () => {
    await user.setIsOnline(true);
    expect(user.isOnline).toBe(true);
  });
  test('setIsOnline() - Can set user offline', async () => {
    await user.setIsOnline(false);
    expect(user.isOnline).toBe(false);
  });

  test('setStatus() - Can set user to OK', async () => {
    const status = 'OK';
    await user.setStatus(status);
    expect(user.status).toBe('OK');
  });

  test('setStatus() - Can set user to need help', async () => {
    const status = 'Help';
    await user.setStatus(status);
    expect(user.status).toBe('Help');
  });
  
  test('getAllUsers() - Can get all users in the collection', async () => {
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

  test('comparePassword() - Return true when the password is correct', async () => {
    const isMatch = await user.comparePassword('123');
    expect(isMatch).toBe(true);
  });

  test('comparePassword() - Return false when the password is not correct', async () => {
    const isMatch = await user.comparePassword('123123123123');
    expect(isMatch).toBe(false);
  });
});
