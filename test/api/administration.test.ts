import supertest from 'supertest';
import mongoose from 'mongoose';
import { MONGODB_URI, setMongoDbUri } from '../../src/config/secrets';
import { User } from '../../src/models/User';

setMongoDbUri(MONGODB_URI + '_administration');
import server from '../../src/server';

const mock = supertest(server);

describe('Administration API', () => {
  let adminToken: string;
  let citizenToken: string;
  let citizenUserID: string;
  const patchedUserProfile = {
    username: 'citizen_user_1',
  };
  const patchedUserProfileWithPassword = {
    username: 'citizen_user_1',
    password: '1234567',
  };
  const recoverUserProfile = {
    username: 'citizen_user',
    password: '123456',
  };
  let patchedPayload: any;
  let patchedPayloadWithPassword: any;
  let recoverPayload: any;
  beforeAll(async () => {
    const admin = new User({
      username: 'admin101',
      password: '123456',
      role: 'administrator',
    });
    await admin.save();
    const citizen = new User({
      username: 'citizen_user',
      password: '123456',
      role: 'citizen',
    });
    await citizen.save();
    const res = await User.findOne({ username: 'citizen_user' }).exec();
    citizenUserID = res._id;
    patchedPayload = { user_id: citizenUserID, user: patchedUserProfile };
    patchedPayloadWithPassword = {
      user_id: citizenUserID,
      user: patchedUserProfileWithPassword,
    };
    recoverPayload = { user_id: citizenUserID, user: recoverUserProfile };
  }, 100000);

  afterAll(async () => {
    console.log(mongoose.connection.db.databaseName + ' deleted');
    await mongoose.connection.db.dropDatabase();
    server.close();
  });

  beforeEach(async () => {
    let res = await mock.post('/auth/login').send({
      username: 'citizen_user',
      password: '123456',
    });
    citizenToken = res.body.token;
    res = await mock.post('/auth/login').send({
      username: 'admin101',
      password: '123456',
    });
    adminToken = res.body.token;
  });

  test('Get /administration/user - without token', async () => {
    const res = await mock.get('/administration/user');
    expect(res.status).toEqual(401);
  });

  test('Get /administration/user - with citizen token', async () => {
    const res = await mock
      .get('/administration/user')
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(res.status).toEqual(401);
  });

  test('Get /administration/user - with administrator token', async () => {
    const res = await mock
      .get('/administration/user')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toEqual(200);
    expect(res.body.users).toHaveLength(2);
  });

  test('Patch /administration/user - without token', async () => {
    const res = await mock.patch('/administration/user').send(patchedPayload);
    expect(res.status).toEqual(401);
  });

  test('Patch /administration/user - with citizen token', async () => {
    const res = await mock
      .patch('/administration/user')
      .send(patchedPayload)
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(res.status).toEqual(401);
  });

  test('Patch /administration/user - with administrator token', async () => {
    let res = await mock
      .patch('/administration/user')
      .send(patchedPayload)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toEqual(200);
    res = await mock
      .patch('/administration/user')
      .send(patchedPayloadWithPassword)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toEqual(200);
    await mock
      .patch('/administration/user')
      .send(recoverPayload)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toEqual(200);
  });
});
