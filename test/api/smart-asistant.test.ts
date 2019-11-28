import supertest from 'supertest';
import mongoose, { mongo } from 'mongoose';
import { MONGODB_URI, setMongoDbUri } from '../../src/config/secrets';
import { Message } from '../../src/models/Message';
import { User } from '../../src/models/User';
import { HospitalInfo } from '../../src/models/HospitalInfo';

setMongoDbUri(MONGODB_URI + '_hospital-info');
import server from '../../src/server';
const mock = supertest(server);

describe('Smart Assistant API', () => {
  let token: string;
  beforeAll(async () => {
    const user = new User({ username: '123', password: '1234' });
    await user.save();

    const message = new Message({
      senderName: 'smart-assistant',
      content: 'I can help you',
      receiverName: '123',
    });
    await message.save();

    const hospital = new HospitalInfo({
      center: '1,2',
      longlat: '3,4',
      address: 'abc',
      category: '0',
      name: 'abc',
    });
    await hospital.save();
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

  test('POST /smart-assistant - Meaningless question', async () => {
    const res = await mock
      .post('/smart-assistant')
      .set('Authorization', `Bearer ${token}`)
      .send({
        senderName: '123',
        message: 'hello',
        location: '-122.083855,37.386051',
      });

    expect(res.status).toEqual(200);
  });

  test('POST /smart-assistant - Meaningful question', async () => {
    const res = await mock
      .post('/smart-assistant')
      .set('Authorization', `Bearer ${token}`)
      .send({
        senderName: '123',
        message: 'I am injured',
        location: '-122.083855,37.386051',
      });

    expect(res.status).toEqual(200);
  });

  test('GET /smart-assistant', async () => {
    const res = await mock
      .get('/smart-assistant')
      .set('Authorization', `Bearer ${token}`)
      .query({
        senderName: 'smart-assistant',
        receiverName: '123',
      });

    expect(res.status).toEqual(200);
    //expect(res.body.messages[0]['content']).toEqual('I can help you');
    expect(res.body.messages[0]['content']).toEqual(
      'Injured? No worry! We can help you!'
    );
  });

  test('GET /smart-assistant/hospital-info', async () => {
    const res = await mock
      .get('/smart-assistant/hospital-info')
      .set('Authorization', `Bearer ${token}`)
      .query({
        location: '1,2',
      });

    expect(res.status).toEqual(200);
    expect(res.body.hospitals[0]['longlat']).toEqual('3,4');
    expect(res.body.hospitals[0]['address']).toEqual('abc');
    expect(res.body.hospitals[0]['category']).toEqual('0');
    expect(res.body.hospitals[0]['name']).toEqual('abc');
  });
});
