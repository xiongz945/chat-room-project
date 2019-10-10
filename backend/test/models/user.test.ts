import mongoose from 'mongoose';

import {User} from '../../src/models/User';
import {MONGODB_URI, SESSION_SECRET} from '../../src/config/secrets';


describe('Test User Model', () => {

  beforeAll(() => {
    const mongoUrl = MONGODB_URI;
    mongoose
    .connect(mongoUrl, { useNewUrlParser: true })
    .then(() => {
    })
    .catch((err) => {
    });
  })

  afterAll(() => {
  })

  test('findUserByName() can find an exsiting user', async () => {
    const existingUser = await User.findUserByName('alice');
    expect(existingUser['username']).toBe('alice');
  });
})

