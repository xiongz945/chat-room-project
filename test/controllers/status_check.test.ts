import mongoose from 'mongoose';
import * as statusCheckController from '../../src/controllers/status_check';

import { StatusCheck } from '../../src/models/StatusCheck';
import { MONGODB_URI } from '../../src/config/secrets';

describe('Test Message Controller', () => {
  beforeAll(async () => {
    const MONGODB_URI_TEST = MONGODB_URI + '_status_check';
    mongoose
      .connect(MONGODB_URI_TEST, { useNewUrlParser: true })
      .then(() => {})
      .catch((err) => {
        console.log(err);
      });

    const statusCheck = new StatusCheck({ userResponses: [] });

    await statusCheck.save();
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  test('patchStatusCheck() - record new status check', async () => {
    const req: any = {
      body: {
        user: { username: 'test' },
        status: '1',
      },
      params: {
        // receiverName: 'public'
      },
    };
    const res: any = {
      status: jest.fn((code) => {
        return res;
      }),
      json: jest.fn((payload) => {
        return res;
      }),
    };
    const next = jest.fn();

    await statusCheckController.patchStatusCheck(req, res, next);
    // expect(res.status).toHaveBeenCalledWith(200);
    // expect(res.json).toHaveBeenCalledWith({
    //   userStatus: '1',
    // });
  });

  test('postStatusCheck() - post a new status check', async () => {
    const req: any = {
      body: {
        // senderName: 'def',
        // senderId: '456',
        // message: 'Testing again',
      },
      params: {
        // receiverName: 'public'
      },
    };
    const res: any = {
      status: jest.fn((code) => {
        return res;
      }),
      json: jest.fn((payload) => {
        return res;
      }),
    };
    const next = jest.fn();

    await statusCheckController.postStatusCheck(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith('{}');
  });

  test('getStatusCheck() - get status checks', async () => {
    const req: any = {
      query: {
        // timestamp: '2019-09-30T19:37:46.495Z',
      },
      params: {
        // receiverName: 'public'
      },
    };
    const res: any = {
      status: jest.fn((code) => {
        return res;
      }),
      json: jest.fn((payload) => {
        return res;
      }),
    };
    const next = jest.fn();

    await statusCheckController.getStatusCheck(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
