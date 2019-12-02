import supertest from 'supertest';
import mongoose, { mongo } from 'mongoose';
import { MONGODB_URI, setMongoDbUri } from '../../src/config/secrets';
import { User } from '../../src/models/User';

setMongoDbUri(MONGODB_URI + '_chatroom');
import server from '../../src/server';
const mock = supertest(server);

describe('Chatroom API', () => {
  let token: string;

  beforeAll(async () => {
    const user = new User({
      username: '123',
      password: '1234',
      role: 'administrator',
    });
    await user.save();
  });

  afterAll(async () => {
    console.log(mongoose.connection.db.databaseName + ' deleted');
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

  test('GET /chat/public/users', async () => {
    const res = await mock
      .get('/chat/public/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toEqual(200);
    expect(res.body.users[0].username).toEqual('123');
  });
});
