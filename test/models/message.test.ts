import mongoose from 'mongoose';

import { Message } from '../../src/models/Message';
import { MONGODB_URI, SESSION_SECRET } from '../../src/config/secrets';

describe('Test Message Model', () => {
  const MONGODB_URI_TEST = MONGODB_URI + '_message_model';
  beforeAll(async () => {
    mongoose
      .connect(MONGODB_URI_TEST, {
        useNewUrlParser: true,
      })
      .then(() => {})
      .catch((err) => {
        console.log(err);
      });

    await new Message({
      senderName: 'kd',
      content: 'Testing',
      receiverName: 'ad',
      createdAt: '2019-09-30T19:37:46.495Z',
    }).save();

    await new Message({
      senderName: 'ad',
      content: 'Testing',
      receiverName: 'kd',
      createdAt: '2019-09-30T19:37:46.495Z',
    }).save();
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  test('updateMessages() - Update the message content', async () => {
    Message.updateMessages('kd', 'james', true);
    const message1s = await Message.find({ receiverName: 'ad' });
    const message1 = message1s[0];
    const message2s = await Message.find({ senderName: 'ad' });
    const message2 = message2s[0];
    expect(message1).toHaveProperty('senderName', 'james');
    expect(message2).toHaveProperty('receiverName', 'james');
  });
});
