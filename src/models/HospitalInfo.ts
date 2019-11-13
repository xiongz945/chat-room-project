import mongoose, { Model } from 'mongoose';
import { EEXIST } from 'constants';

export interface IHospitalInfoDocument extends mongoose.Document {
  lonlat: String;
  name: String;
  category: String;
  address: String;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHospitalInfoModel extends Model<IHospitalInfoDocument> {
  searchHospitals(
    keyword: string,
    projection?: string
  ): IHospitalInfoDocument[];
}

const hospitalInfoSchema = new mongoose.Schema(
  {
    lonlat: String,
    name: String,
    category: String,
    address: String,
  },
  { timestamps: true }
);

hospitalInfoSchema.index({
  lonlat: 'text',
});

hospitalInfoSchema.statics.searchHospitals = async function searchHospitals(
  longlat: string,
  projection: string = undefined
) {
  const conditions: any = {
    $text: { $search: longlat },
  };
  try {
    return await HospitalInfo.find(conditions, projection)
      .sort({ createdAt: -1 })
      .exec();
  } catch (err) {
    throw err;
  }
};

export const HospitalInfo: IHospitalInfoModel = mongoose.model<
  IHospitalInfoDocument,
  IHospitalInfoModel
>('HospitalInfo', hospitalInfoSchema);
