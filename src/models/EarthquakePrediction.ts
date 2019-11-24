import mongoose, { Model } from 'mongoose';

interface ICoordinate {
  longitude: Number;
  latitude: Number;
}

export interface IEarthquakePredictionDocument extends mongoose.Document {
  occurred_datetime: Date;
  description: String;
  magnitude: Number;
  location: ICoordinate;
  predictorName: String;
}

export interface IEarthquakePredictionModel
  extends Model<IEarthquakePredictionDocument> {}

const earthquakePredictionSchema = new mongoose.Schema(
  {
    occurred_datetime: Date,
    description: String,
    magnitude: Number,
    location: {
      longitude: Number,
      latitude: Number,
    },
    predictorName: String,
  },
  { collection: 'earthquake_predictions' }
);

export const EarthquakePrediction: IEarthquakePredictionModel = mongoose.model<
  IEarthquakePredictionDocument,
  IEarthquakePredictionModel
>('EarthquakePrediction', earthquakePredictionSchema);
