import supertest from 'supertest';
import mongoose from 'mongoose';
import { MONGODB_URI, setMongoDbUri } from '../../src/config/secrets';
import { User } from '../../src/models/User';

setMongoDbUri(MONGODB_URI + '_auth');
import server from '../../src/server';
import {
  IEarthquakeReportDocument,
  EarthquakeReport,
} from '../../src/models/EarthquakeReport';

const mock = supertest(server);

describe('Earthquake API', () => {
  let citizenToken: string;
  let coordinatorToken: string;
  let patchReportID: string;
  const postedReport = {
    occurred_datetime: new Date(),
    description: 'test_post_report',
    magnitude: 2.0,
    location: {
      longitude: 0.0,
      latitude: 0.0,
    },
    killed: 0,
    injured: 0,
    missing: 0,
  };
  let patchedPayload: any;
  const postedPrediction = {
    occurred_datetime: new Date(),
    description: 'test_post_prediction',
    magnitude: 2.0,
    location: {
      longitude: 0.0,
      latitude: 0.0,
    },
  };
  beforeAll(async () => {
    const citizen = new User({ username: 'citizen_user', password: '123456' });
    await citizen.save();

    const coordinator = new User({
      username: 'coordinator_user',
      password: '123456',
      role: 'coordinator',
    });
    await coordinator.save();

    const testGetReport = new EarthquakeReport({
      occurred_datetime: new Date(),
      description: 'test_get_report',
      magnitude: 2.0,
      location: {
        longitude: 0.0,
        latitude: 0.0,
      },
      killed: 0,
      injured: 0,
      missing: 0,
      reporterName: 'a',
    });
    await testGetReport.save();

    const testPatchReport = new EarthquakeReport({
      occurred_datetime: new Date(),
      description: 'test_patch_report',
      magnitude: 2.0,
      location: {
        longitude: 0.0,
        latitude: 0.0,
      },
      killed: 0,
      injured: 0,
      missing: 0,
      reporterName: 'citizen_user',
    });
    await testPatchReport.save();
    const res = await EarthquakeReport.findOne({
      description: 'test_patch_report',
    }).exec();
    patchReportID = res._id;
    patchedPayload = {
      report_id: patchReportID,
      report: {
        occurred_datetime: new Date(),
        description: 'test_patch_report',
        magnitude: 2.0,
        location: {
          longitude: 0.0,
          latitude: 0.0,
        },
        killed: 1,
        injured: 1,
        missing: 1,
        reporterName: 'citizen_user',
      },
    };
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
      username: 'coordinator_user',
      password: '123456',
    });
    coordinatorToken = res.body.token;
  });

  test('POST /earthquake/report - Unauthorized', async () => {
    const res = await mock.post('/earthquake/report').send(postedReport);
    expect(res.status).toEqual(401);
  });

  test('Post /earthquake/report - Authorized', async () => {
    const res = await mock
      .post('/earthquake/report')
      .send(postedReport)
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(res.status).toEqual(200);
  });

  test('GET /earthquake/report - Unauthorized', async () => {
    const res = await mock.get('/earthquake/report');
    expect(res.status).toEqual(401);
  });

  test('GET /earthquake/report - Authorized', async () => {
    const res = await mock
      .get('/earthquake/report')
      .set('Authorization', `Bearer ${citizenToken}`);
    let flag = false;
    res.body.reports.forEach((report: IEarthquakeReportDocument) => {
      if (report.description == 'test_get_report') flag = true;
    });
    expect(flag).toBeTruthy();
  });

  test('PATCH /earthquake/report - without token', async () => {
    const res = await mock.patch('/earthquake/report').send(patchedPayload);
    expect(res.status).toEqual(401);
  });

  test('PATCH /earthquake/report - with unmatched token', async () => {
    const res = await mock
      .patch('/earthquake/report')
      .send(patchedPayload)
      .set('Authorization', `Bearer ${coordinatorToken}`);
    expect(res.status).toEqual(401);
  });

  test('PATCH /earthquake/report - with matched token', async () => {
    const res = await mock
      .patch('/earthquake/report')
      .send(patchedPayload)
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(res.status).toEqual(200);
    const queryRes = await EarthquakeReport.findById(patchReportID).exec();
    expect(queryRes.killed).toEqual(1);
    expect(queryRes.injured).toEqual(1);
    expect(queryRes.missing).toEqual(1);
  });

  test('POST /earthquake/prediction - without token', async () => {
    const res = await mock
      .post('/earthquake/prediction')
      .send(postedPrediction);
    expect(res.status).toEqual(401);
  });

  test('POST /earthquake/prediction - with citizen token', async () => {
    const res = await mock
      .post('/earthquake/prediction')
      .send(postedPrediction)
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(res.status).toEqual(401);
  });

  test('POST /earthquake/prediction - with coordinator token', async () => {
    const res = await mock
      .post('/earthquake/prediction')
      .send(postedPrediction)
      .set('Authorization', `Bearer ${coordinatorToken}`);
    expect(res.status).toEqual(200);
  });
});
