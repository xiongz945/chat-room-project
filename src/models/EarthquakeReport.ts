import mongoose, { Model } from 'mongoose';

interface ICoordinate {
  longitude: Number;
  latitude: Number;
}

export interface IEarthquakeReportDocument extends mongoose.Document {
  occurred_datetime: Date;
  description: String;
  magnitude: Number;
  location: ICoordinate;
  killed: Number;
  injured: Number;
  missing: Number;
  reporterName: String;
}

export interface IEarthquakeReportModel
  extends Model<IEarthquakeReportDocument> {}

const earthquakeReportSchema = new mongoose.Schema(
  {
    occurred_datetime: Date,
    description: String,
    magnitude: Number,
    location: {
      longitude: Number,
      latitude: Number,
    },
    killed: Number,
    injured: Number,
    missing: Number,
    reporterName: String,
  },
  { collection: 'earthquake_reports' }
);

export const EarthquakeReport: IEarthquakeReportModel = mongoose.model<
  IEarthquakeReportDocument,
  IEarthquakeReportModel
>('EarthquakeReport', earthquakeReportSchema);
