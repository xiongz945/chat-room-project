import mongoose, { Model } from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    name: String,
    locationName: String,
    placeID: String,
    status: String,
    desc: String,
  },
  {
    timestamps: true,
  }
);

export interface ILocationDocument extends mongoose.Document {
  name: String;
  location: String;
  placeID: String;
  desc: String;
  status: String;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILocationModel extends Model<ILocationDocument> {
  getLocation(name: string, timestamp: any): ILocationDocument;
  getAllLocation(): ILocationDocument[];
  createNewLocation(
    name: string,
    location: string,
    placeID: string,
    status: string,
    desc: string
  ): ILocationDocument;
  updateLocation(oldUsername: string, newUsername: string): void;
}

locationSchema.statics.createNewLocation = async function createNewLocation(
  name: string,
  location: string,
  placeID: string,
  status: string,
  desc: string
) {
  const new_location = new Location({ name, location, placeID, status, desc });
  try {
    return await new_location.save();
  } catch (err) {
    throw err;
  }
};

locationSchema.statics.getLocation = async function getLocation(
  username: string,
  timestamp: any
) {
  try {
    return await Location.find({
      name: username,
      createdAt: timestamp,
    }).exec();
  } catch (err) {
    throw err;
  }
};

locationSchema.statics.getAllLocation = async function getAllLocation() {
  try {
    return await Location.find({}).exec();
  } catch (err) {
    throw err;
  }
};

locationSchema.statics.updateLocation = async function updateLocation(
  oldUsername: string,
  newUsername: string
) {
  try {
    const filter = {name: oldUsername};
    const update = {
      "$set":{name: newUsername}
    };
    await Location.update(filter, update, {"multi": true});
  } catch (err) {
    throw err;
  }
}

export const Location: ILocationModel = mongoose.model<
  ILocationDocument,
  ILocationModel
>('Location', locationSchema);
