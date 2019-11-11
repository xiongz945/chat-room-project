import supertest from 'supertest';
import mongoose, { mongo } from 'mongoose';
import { MONGODB_URI, setMongoDbUri } from '../../src/config/secrets';
import { User } from '../../src/models/User';
import { Message } from '../../src/models/Message';

setMongoDbUri(MONGODB_URI + '_search');
import server from '../../src/server';
const mock = supertest(server);

describe('Search API', () => {
  let token: string;
  beforeAll(async () => {
    const alice = new User({ username: 'alice', password: '123456' });
    await alice.save();
    const bob = new User({ username: 'bob', password: '123456' });
    await bob.save();
    const cindy = new User({
      username: 'cindy',
      password: '123456',
      isOnline: true,
    });
    await cindy.save();
    const cindy_1 = new User({
      username: 'cindy_1',
      password: '123456',
      status: 'OK',
    });
    await cindy_1.save();

    const publicMessage_1 = new Message({
      senderName: 'alice',
      content: 'Live long and prosper.',
      receiverName: 'public',
      createdAt: '2019-09-30T19:37:46.495Z',
    });
    await publicMessage_1.save();
    const publicMessage_2 = new Message({
      senderName: 'bob',
      content: 'May the force be with you, always.',
      receiverName: 'public',
      createdAt: '2019-09-30T19:40:46.495Z',
    });
    await publicMessage_2.save();

    const privateMessage_1 = new Message({
      senderName: 'alice',
      content: 'Live long and prosper.',
      receiverName: 'bob',
      createdAt: '2019-09-30T19:37:46.495Z',
    });
    await privateMessage_1.save();
    const privateMessage_2 = new Message({
      senderName: 'bob',
      content: 'Live long and prosper.',
      receiverName: 'alice',
      createdAt: '2019-09-30T19:45:46.495Z',
    });
    await privateMessage_2.save();
    const privateMessage_3 = new Message({
      senderName: 'cindy',
      content: 'Live long and prosper.',
      receiverName: 'cindy_1',
      createdAt: '2019-09-30T19:37:46.495Z',
    });
    await privateMessage_3.save();

    const announcement_1 = new Message({
      senderName: 'alice',
      content: 'Live long and prosper.',
      receiverName: 'announcement',
      createdAt: '2019-09-30T19:37:46.495Z',
    });
    await announcement_1.save();

    const announcement_2 = new Message({
      senderName: 'bob',
      content: 'May the force be with you, always.',
      receiverName: 'announcement',
      createdAt: '2019-09-30T19:40:46.495Z',
    });
    await announcement_2.save();
  }, 10000);

  afterAll(async () => {
    console.log(mongoose.connection.db.databaseName + ' deleted');
    await mongoose.connection.db.dropDatabase();
    server.close();
  });

  beforeEach(async () => {
    const res = await mock.post('/auth/login').send({
      username: 'alice',
      password: '123456',
    });
    token = res.body.token;
  });

  test('GET /search/users/username ', async () => {
    const searchUsernameRes = await mock
      .get('/search/users/username')
      .set('Authorization', `Bearer ${token}`)
      .query({ keyword: 'i' });
    expect(searchUsernameRes.status).toEqual(200);
    expect(searchUsernameRes.body['users']).toHaveLength(3);
    expect(searchUsernameRes.body['users'][0]['username']).toEqual('cindy');
  });

  test('GET /search/users/status', async () => {
    const searchUserStatusRes = await mock
      .get('/search/users/status')
      .set('Authorization', `Bearer ${token}`)
      .query({ keyword: 'OK' });
    expect(searchUserStatusRes.status).toEqual(200);
    expect(searchUserStatusRes.body['users']).toHaveLength(1);
    expect(searchUserStatusRes.body['users'][0]['status']).toEqual('OK');
  });

  test('GET /search/messages/public', async () => {
    const searchPublicMessageRes = await mock
      .get('/search/messages/public')
      .set('Authorization', `Bearer ${token}`)
      .query({ keyword: 'prosper force' });
    expect(searchPublicMessageRes.status).toEqual(200);
    expect(searchPublicMessageRes.body['messages']).toHaveLength(2);
    expect(searchPublicMessageRes.body['messages'][0]['senderName']).toEqual(
      'bob'
    );
  });

  test('GET /search/messages/private', async () => {
    const searchPrivateMessageRes = await mock
      .get('/search/messages/private')
      .set('Authorization', `Bearer ${token}`)
      .query({ keyword: 'prosper force' });
    expect(searchPrivateMessageRes.status).toEqual(200);
    expect(searchPrivateMessageRes.body['messages']).toHaveLength(2);
    expect(searchPrivateMessageRes.body['messages'][0]['senderName']).toEqual(
      'bob'
    );
  });

  test('GET /search/announcements', async () => {
    const searchAnnouncementRes = await mock
      .get('/search/announcements')
      .set('Authorization', `Bearer ${token}`)
      .query({ keyword: 'prosper force' });
    expect(searchAnnouncementRes.status).toEqual(200);
    expect(searchAnnouncementRes.body['announcement']).toHaveLength(2);
    expect(searchAnnouncementRes.body['announcement'][0]['senderName']).toEqual(
      'bob'
    );
  });
});
