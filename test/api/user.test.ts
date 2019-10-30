import supertest from 'supertest';
import mongoose, { mongo } from 'mongoose';
import server from '../../src/server';
import { MONGODB_URI, setMongoDbUri } from '../../src/config/secrets';
import { Message } from '../../src/models/Message';
import { User } from '../../src/models/User';
setMongoDbUri(MONGODB_URI + '_message');
const mock = supertest(server);
describe('Message API', () => {
  let token: string;
  beforeAll(async () => {
    const message = new Message({
      senderName: '123',
      content: 'message',
      receiverName: 'public',
      createdAt: '2019-09-30T19:37:46.495Z',
    });
    await message.save();
    const user = new User({ username: '123', password: '1234' });
    await user.save();
  }, 10000);
  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    server.close();
  });
  beforeEach(async () => {
    const res = await mock.post('/auth/login').send({
      username: '123',
      password: '1234',
    });
    token = res.body.token;
  });
  test('GET /user/me/profile', async () => {
    const res = await mock
      .get('/user/me/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toEqual(200);
  });

  test('PATCH /user/me/status', async () => {
    const res = await mock
      .patch('/user/me/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'OK' });

    expect(res.status).toEqual(200);
  });

  test('PATCH /user/me/isOnline', async () => {
    const res = await mock
      .patch('/user/me/isOnline')
      .set('Authorization', `Bearer ${token}`)
      .send({ isOnline: false });

    expect(res.status).toEqual(200);
  });

  test('PATCH /user/me/profile', async () => {
    const res = await mock
      .patch('/user/me/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'whatever' });
    expect(res.status).toEqual(200);
  });

  test('PATCH /user/me/password', async () => {
    const res = await mock
      .patch('/user/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: '123', confirmPassword: '123' });
    expect(res.status).toEqual(200);
  });
});
