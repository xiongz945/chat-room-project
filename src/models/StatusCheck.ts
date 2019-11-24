import mongoose, { Model } from 'mongoose';

export interface IStatusCheckDocument extends mongoose.Document {
  userResponses: [
    {
      username: String;
      status: String;
    }
  ];
}

export interface IStatusCheckModel extends Model<IStatusCheckDocument> {
  latestStatusCheck(): any;
}

const statusCheckSchema = new mongoose.Schema(
  {
    userResponses: [
      {
        username: String,
        status: String,
      },
    ],
  },
  { timestamps: true }
);

statusCheckSchema.statics.latestStatusCheck = async function latestStatusCheck() {};

export const StatusCheck: IStatusCheckModel = mongoose.model<
  IStatusCheckDocument,
  IStatusCheckModel
>('StatusCheck', statusCheckSchema);
