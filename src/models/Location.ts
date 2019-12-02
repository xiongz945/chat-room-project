import mongoose, { Model } from 'mongoose';

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
  getLocation(id: string): ILocationDocument;
  getAllLocation(): ILocationDocument[];
  createNewLocation(
    name: string,
    location: string,
    placeID: string,
    status: string,
    desc: string
  ): ILocationDocument;
  markAsSafe(id: string): ILocationDocument;
}

const locationSchema = new mongoose.Schema(
  {
    name: String,
    location: String,
    placeID: String,
    status: String,
    desc: String,
  },
  {
    timestamps: true,
  }
);

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

locationSchema.statics.getLocation = async function getLocation(id: string) {
  try {
    // const objectId = "ObjectId(" + id + ")";
    return await Location.find({
      _id: id,
    }).exec();
  } catch (err) {
    throw err;
  }
};

locationSchema.statics.getAllLocation = async function getAllLocation() {
  try {
    return await Location.find({})
      .sort({ createdAt: -1 })
      .exec();
  } catch (err) {
    throw err;
  }
};

locationSchema.statics.markAsSafe = async function markAsSafe(id: string) {
  try {
    await Location.updateOne({ _id: id }, { status: 'OK' });
  } catch (err) {
    throw err;
  }
};

export const Location: ILocationModel = mongoose.model<
  ILocationDocument,
  ILocationModel
>('Location', locationSchema);
