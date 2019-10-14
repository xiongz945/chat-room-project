import mongoose from 'mongoose';

import { User } from '../../src/models/User';
import { MONGODB_URI } from '../../src/config/secrets';
import * as userController from '../../src/controllers/user';

describe('Test User Controller', () => {
  const MONGODB_URI_TEST = MONGODB_URI + '_user';
  beforeAll(async () => {
    mongoose
      .connect(MONGODB_URI_TEST, { useNewUrlParser: true })
      .then(() => {})
      .catch((err) => {
        console.log(err);
      });

    const user = new User({ username: '123', password: '1234' });
    user.profile = { name: '123' };
    await user.save();
    const user2 = new User({ username: '1234', password: '1234' });
    await user2.save();
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  test('getProfile() - Get existing user progile', async () => {
    const user = await User.findOne({ username: '123' }).exec();
    const req: any = {
      user: { id: user.id },
    };
    const res: any = {
      status: jest.fn(() => {
        return res;
      }),
      json: jest.fn(() => {
        return res;
      }),
    };

    const next: any = jest.fn((para) => {
      console.log(para);
      return next;
    });

    await userController.getProfile(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ userProfile: user.profile });
  });

  test('patchUpdateIsOnline() - Update user online status', async () => {
    const user = await User.findOne({ username: '123' }).exec();

    const req: any = {
      user,
      body: { isOnline: false },
    };
    const res: any = {
      status: jest.fn(() => {
        return res;
      }),
      json: jest.fn(() => {
        return res;
      }),
    };

    const next: any = jest.fn();

    await userController.patchUpdateIsOnline(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'success',
      isOnline: false,
    });
  });

  test('patchUpdateStatus() - Update user status', async () => {
    const user = await User.findOne({ username: '123' }).exec();

    const req: any = {
      user,
      body: { status: 'OK' },
    };
    const res: any = {
      status: jest.fn(() => {
        return res;
      }),
      json: jest.fn(() => {
        return res;
      }),
    };

    const next: any = jest.fn();

    await userController.patchUpdateStatus(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'success',
      status: 'OK',
    });
  });

  test('patchUpdateProfile() - Update user profile', async () => {
    const user = await User.findOne({ username: '123' }).exec();

    const req: any = {
      user,
      body: {
        name: 'Xiang',
        gender: 'Male',
        phone: '123456789',
        location: 'Mountain View',
      },
    };
    const res: any = {
      status: jest.fn(() => {
        return res;
      }),
      json: jest.fn(() => {
        return res;
      }),
    };

    const next: any = jest.fn();

    await userController.patchUpdateProfile(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'success',
      userProfile: {
        name: 'Xiang',
        gender: 'Male',
        phone: '123456789',
        location: 'Mountain View',
      },
      username: '123',
    });
  });

  test('patchUpdateProfile() - Update user profile with already existing username', async () => {
    const user = await User.findOne({ username: '123' }).exec();

    const req: any = {
      user,
      body: {
        username: '1234',
      },
    };
    const res: any = {
      status: jest.fn(() => {
        return res;
      }),
      json: jest.fn(() => {
        return res;
      }),
    };

    const next: any = jest.fn();

    await userController.patchUpdateProfile(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      err:
        'The username you have entered is already associated with an account.',
    });
  });

  test('patchUpdatePassword() - Update user password', async () => {
    const user = await User.findOne({ username: '123' }).exec();

    const req: any = {
      user,
      body: {
        confirmPassword: '12345',
        password: '12345',
      },
    };
    const res: any = {
      status: jest.fn(() => {
        return res;
      }),
      json: jest.fn(() => {
        return res;
      }),
    };

    const next: any = jest.fn();

    await userController.patchUpdatePassword(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'success',
    });
  });
});
