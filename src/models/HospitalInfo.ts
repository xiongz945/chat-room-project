import mongoose, { Model } from 'mongoose';
import { EEXIST } from 'constants';

export interface IHospitalInfoDocument extends mongoose.Document {
  center: String;
  longlat: String;
  name: String;
  category: String;
  address: String;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHospitalInfoModel extends Model<IHospitalInfoDocument> {
  searchHospitals(center: string): IHospitalInfoDocument[];
}

const hospitalInfoSchema = new mongoose.Schema(
  {
    center: String,
    longlat: String,
    name: String,
    category: String,
    address: String,
  },
  { timestamps: true }
);

hospitalInfoSchema.index({
  center: 'text',
});

hospitalInfoSchema.statics.searchHospitals = async function searchHospitals(
  center: string
) {
  try {
    return await HospitalInfo.find({ center: center })
      .sort({ createdAt: -1 })
      .exec();
  } catch (err) {
    // throw err
    console.log(err);
    return undefined;
  }
};

export const HospitalInfo: IHospitalInfoModel = mongoose.model<
  IHospitalInfoDocument,
  IHospitalInfoModel
>('HospitalInfo', hospitalInfoSchema);
