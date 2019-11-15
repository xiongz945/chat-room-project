import mongoose from 'mongoose';

import {
  IHospitalInfoDocument,
  HospitalInfo,
} from '../../src/models/HospitalInfo';
import { MONGODB_URI, SESSION_SECRET } from '../../src/config/secrets';

describe('Test Hospital Info Model', () => {
  let hospital: IHospitalInfoDocument;
  const MONGODB_URI_TEST = MONGODB_URI + '_hospital-info';
  beforeAll(async () => {
    mongoose
      .connect(MONGODB_URI_TEST, {
        useNewUrlParser: true,
      })
      .then(() => {})
      .catch((err) => {
        console.log(err);
      });

    hospital = new HospitalInfo({
      center: '1,2',
      longlat: '3,4',
      address: 'abc',
      category: '0',
      name: 'abc',
    });
    await hospital.save();
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  test('searchHospitals() - Can find an existing hospital', async () => {
    const hospitals: IHospitalInfoDocument[] = await HospitalInfo.searchHospitals(
      '1,2'
    );
    expect(hospitals.length).toBe(1);

    const hospital = hospitals[0];
    expect(hospital['longlat']).toBe('3,4');
    expect(hospital['address']).toBe('abc');
    expect(hospital['category']).toBe('0');
    expect(hospital['name']).toBe('abc');
  });

  test('searchHospitals() - Cannot find a non-existing hospital', async () => {
    const hospital = await HospitalInfo.searchHospitals('3,4');
    expect(hospital.length).toBe(0);
  });
});
