import mongoose, { mongo } from 'mongoose'
import { MONGODB_URI} from '../../src/config/secrets'
import {ILocationDocument, Location} from '../../src/models/Location'

describe('Test Location Model', () => {
    let test_location: ILocationDocument;
    let docId: string;
    const MONGODB_URI_TEST = MONGODB_URI + '_location_model';
    beforeAll(async () => {
        mongoose.connect(MONGODB_URI_TEST, {
            useNewUrlParser: true,
        })
        .then(()=>{})
        .catch((err) => {
            console.log(err);
        });

        test_location = new Location({
            name: 'justin',
            location: '99 Ranch Drive, Milpitas, CA, USA',
            placeID: 'ChIJSWqalN_Ij4ARgQMxGTbmhe0',
            status: 'Emergency',
            desc: 'I am not okay',            
        });

        await test_location.save();
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
    })

    test('test getAllLocation() - can get all locations', async () => {
        const locations = await Location.getAllLocation();
        expect(locations.length).toBe(1);
    })


})