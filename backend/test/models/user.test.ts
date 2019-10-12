import mongoose from 'mongoose';

import { User } from '../../src/models/User';
import { MONGODB_URI, SESSION_SECRET } from '../../src/config/secrets';

describe('Test User Model', () => {
  beforeAll(async () => {
    mongoose
      .connect(MONGODB_URI, { useNewUrlParser: true })
      .then(() => {})
      .catch((err) => {
        console.log(err);
      });

    const user = new User({ username: '123', password: '123' });
    await user.save();
  });

  afterAll(async () => {
    await User.deleteOne({ username: '123' });
  });

  test('findUserByName() can find an exsiting user', async () => {
    const existingUser = await User.findUserByName('123');
    expect(existingUser['username']).toBe('123');
  });
});
