import supertest from 'supertest';
import mongoose, { mongo } from 'mongoose';
import { MONGODB_URI, setMongoDbUri } from '../../src/config/secrets';
import { User } from '../../src/models/User';

setMongoDbUri(MONGODB_URI + '_auth');
import server from '../../src/server';
const mock = supertest(server);

describe('Auth API', () => {
  beforeAll(async () => {
    const user = new User({ username: '123', password: '1234' });
    await user.save();
  });

  afterAll(async () => {
    console.log(mongoose.connection.db.databaseName + ' deleted');
    await mongoose.connection.db.dropDatabase();
    server.close();
  });

  test('POST /auth/login ', async () => {
    const res = await mock.post('/auth/login').send({
      username: '123',
      password: '1234',
    });

    expect(res.status).toEqual(200);
  });

  test('GET /auth/logout', async () => {
    const login = await mock.post('/auth/login').send({
      username: '123',
      password: '1234',
    });

    const token = login.body.token;
    const res = await mock
      .get('/auth/logout')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toEqual(200);
  });
});
