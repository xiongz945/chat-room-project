import superagent from 'superagent';
import supertest from 'supertest';
import mongoose, { mongo } from 'mongoose';
import server from '../../src/server';
import { MONGODB_URI } from '../../src/config/secrets';
import { User } from '../../src/models/User';


describe('Auth API', () => {

  const mock = supertest(server);
  const user = new User({ username: '123', password: '1234' });

  beforeAll(async () => {
    await user.save();
  });

  afterAll(async () => {
    await user.remove();
  });

  test('POST /auth/login ', async () => {

    const res = await mock.post('/auth/login').send({
      'username': '123',
      'password': '1234'
    });

    expect(res.status).toEqual(200);
  });
});
