import mongoose from 'mongoose';
import {
  IEarthquakeReportDocument,
  EarthquakeReport,
} from '../../src/models/EarthquakeReport';
import { MONGODB_URI } from '../../src/config/secrets';

describe('Test Earthquake Report Model', () => {
  const MONGODB_URI_TEST = MONGODB_URI + '_user_model';
  beforeAll(async () => {
    mongoose
      .connect(MONGODB_URI_TEST, {
        useNewUrlParser: true,
      })
      .then(() => {})
      .catch((err) => {
        console.log(err);
      });
    const report = {
      occurred_datetime: new Date(),
      description: 'test1',
      magnitude: 2.0,
      location: {
        longitude: 0.0,
        latitude: 0.0,
      },
      killed: 0,
      injured: 0,
      missing: 0,
      reporterName: 'a',
    };
    await new EarthquakeReport(report).save();
    report['description'] = 'test2';
    await new EarthquakeReport(report).save();
    report['description'] = 'test3';
    await new EarthquakeReport(report).save();
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  test('test getAllReports', async () => {
    const allReports = await EarthquakeReport.getAllReports();
    expect(allReports).toHaveLength(3);
  });

  test('test updateReport', async () => {
    EarthquakeReport.updateReport('a', 'b');
    const reports = await EarthquakeReport.find();
    for (let i = 0; i < reports.length; ++i) {
      expect(reports[i]).toHaveProperty('reporterName', 'b');
    }
  });
});
