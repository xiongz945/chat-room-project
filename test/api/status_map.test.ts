import supertest from 'supertest';
import mongoose, { mongo } from 'mongoose';
import { MONGODB_URI, setMongoDbUri } from '../../src/config/secrets';
import { User } from '../../src/models/User';
import { Location } from '../../src/models/Location';

setMongoDbUri(MONGODB_URI + '_statusmap');
import server from '../../src/server';
const mock = supertest(server);

describe('Statusmap API', () => {
  let token: string;
  let docId: string;
  beforeAll(async () => {
    const user = new User({
      username: 'justin',
      password: '1234',
      role: 'administrator',
    });
    await user.save();

    const location = new Location({
      name: 'justin',
      location: '99 Ranch Drive, Milpitas, CA, USA',
      placeID: 'ChIJSWqalN_Ij4ARgQMxGTbmhe0',
      status: 'Emergency',
      desc: 'I am not okay',
    });
    await location.save((err, doc) => {
      docId = doc._id;
    });
  }, 10000);

  afterAll(async () => {
    console.log(mongoose.connection.db.databaseName + ' deleted');
    await mongoose.connection.db.dropDatabase();
    server.close();
  });

  beforeEach(async () => {
    const res = await mock.post('/auth/login').send({
      username: 'justin',
      password: '1234',
    });
    token = res.body.token;
  });

  test('GET /location', async () => {
    const res = await mock
      .get('/location')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toEqual(200);
    expect(res.body.locations[0]['name']).toEqual('justin');
  });

  test('GET /location/docId', async () => {
    console.log(docId);
    const res = await mock
      .get('/location/' + docId)
      .set('Authorization', `Bearer ${token}`);
    console.log(res.body.location);
    expect(res.status).toEqual(200);
    expect(res.body.location[0]['name']).toEqual('justin');
  });

  test('POST /location/amy/', async () => {
    const res = await mock
      .post('/location/amy')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'amy',
        desc: 'I am amy',
        location: 'NASA Ames Research Center Boundary, Mountain View, CA, USA',
        placeid:
          'EjpOQVNBIEFtZXMgUmVzZWFyY2ggQ2VudGVyIEJvdW5kYXJ5LCBNb3VudGFpbiBWaWV3LCBDQSwgVVNBIi4qLAoUChIJq4O19t65j4ARAhQiFO6yMNwSFAoSCYkB7FtJt4-AEZuva0ZK1Bd8',
        status: 'Help',
      });

    expect(res.status).toEqual(200);
  });

  test('PATCH /location/docId/status', async () => {
    const res = await mock
      .patch('/location/' + docId + '/status')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toEqual(200);
  });
});
