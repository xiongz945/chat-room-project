import * as statusmapController from '../../src/controllers/statusmap';
import { MONGODB_URI } from '../../src/config/secrets';
import { Location } from '../../src/models/Location';
import mongoose from 'mongoose';

describe('Test statusmap controller', () => {
  let docId: string;
  beforeAll(async () => {
    const MONGODB_URI_TEST = MONGODB_URI + '_statusmap';
    mongoose
      .connect(MONGODB_URI_TEST, { useNewUrlParser: true })
      .then(() => {})
      .catch((err) => {
        console.log(err);
      });

    const test_location = new Location({
      name: 'justin',
      location: '99 Ranch Drive, Milpitas, CA, USA',
      placeID: 'ChIJSWqalN_Ij4ARgQMxGTbmhe0',
      status: 'Emergency',
      desc: 'I am not okay',
    });

    await test_location.save((err, doc) => {
      if (err) {
        console.log(err);
      } else {
        docId = doc._id;
        // console.log(docId);
      }
    });
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
  });


  test('updateStatus() - successfully mark one user as safe', async () => {
    const req: any = {
      params: {
        id: docId,
      },
    };
    const res: any = {
      status: jest.fn((code) => {
        return res;
      }),
      json: jest.fn((resp: any) => {}),
    };
    const next = jest.fn();
    await statusmapController.updateStatus(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({});
  });

  test('postNewLocation() - successfully post one new location', async () => {
    const req: any = {
      params: {
        name: 'Amy',
      },
      body: {
        location: 'McDaniel Avenue, San Jose, CA, USA',
        placeid:
          'EiJNY0RhbmllbCBBdmVudWUsIFNhbiBKb3NlLCBDQSwgVVNBIi4qLAoUChIJVw1nqRbLj4ARL2wLcXZeHL8SFAoSCfU_-Yrkyo-AEXtxn8oKjJ25',
        status: 'Help',
        desc: 'I need help',
      },
    };
    const res: any = {
      status: jest.fn((code) => {
        return res;
      }),
      json: jest.fn((resp: any) => {}),
    };
    const next = jest.fn();
    await statusmapController.postNewLocation(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({});
  });



  test('getAllLocation() - return all locations successfully', async () => {
    const req: any = {};
    const res: any = {
      status: jest.fn((code) => {
        return res;
      }),
      json: jest.fn((resp: any) => {
        console.log(resp);
        resp.locations[0] = resp.locations[0].toObject();
        delete resp.locations[0].createdAt;
        delete resp.locations[0].__v;
        delete resp.locations[0]._id;
        delete resp.locations[0].updatedAt;
        return res;
      }),
    };
    const next = jest.fn();

    await statusmapController.getAllLocation(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      locations: [
        {
          name: 'justin',
          location: '99 Ranch Drive, Milpitas, CA, USA',
          placeID: 'ChIJSWqalN_Ij4ARgQMxGTbmhe0',
          status: 'Emergency',
          desc: 'I am not okay',
        },
      ],
    });
  });

  test('getLocation() - return one location successfully', async () => {
    const req: any = {
      params: {
        id: docId,
      },
    };
    const res: any = {
      status: jest.fn((code) => {
        return res;
      }),
      json: jest.fn((resp: any) => {
        resp.location[0] = resp.location[0].toObject();
        delete resp.location[0].createdAt;
        delete resp.location[0].__v;
        delete resp.location[0]._id;
        delete resp.location[0].updatedAt;
        return res;
      }),
    };
    const next = jest.fn();
    await statusmapController.getLocation(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      location: [
        {
          name: 'justin',
          location: '99 Ranch Drive, Milpitas, CA, USA',
          placeID: 'ChIJSWqalN_Ij4ARgQMxGTbmhe0',
          status: 'Emergency',
          desc: 'I am not okay',
        },
      ],
    });
  });

});
