import mongoose, { Model } from 'mongoose';

export interface IStatusCheckDocument extends mongoose.Document {
  userResponses: {
    username: String;
    status: String;
  };
}

export interface IStatusCheckModel extends Model<IStatusCheckDocument> {
  latestStatusCheck(): any;
}

const statusCheckSchema = new mongoose.Schema(
  {
    timestamp: Date,
    userResponses: {
      username: String,
      status: String,
    },
  },
  { timestamps: true }
);

statusCheckSchema.statics.latestStatusCheck = async function latestStatusCheck() {
  try {
    return await StatusCheck.findOne()
      .sort({ created_at: -1 })
      .exec();
  } catch (err) {
    throw err;
  }
};

export const StatusCheck: IStatusCheckModel = mongoose.model<
  IStatusCheckDocument,
  IStatusCheckModel
>('StatusCheck', statusCheckSchema);
