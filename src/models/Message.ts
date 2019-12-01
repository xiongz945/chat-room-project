import mongoose, { Model } from 'mongoose';
import { User } from './User';

export interface IMessageDocument extends mongoose.Document {
  senderName: String;
  receiverName: String;
  content: String;
  voice: String;
  status: String;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessageModel extends Model<IMessageDocument> {
  searchPublicMessages(
    keyword: string,
    projection?: string
  ): IMessageDocument[];
  searchPrivateMessages(
    searcherName: string,
    keyword: string,
    projection?: string
  ): IMessageDocument[];
  searchAnnouncements(
    keyword: string,
    numOfResults: number,
    projection?: string
  ): IMessageDocument[];
  updateMessages(oldUsername: string, newUsername: string): void;
}

const messageSchema = new mongoose.Schema(
  {
    senderName: String,
    receiverName: {
      type: String,
      default: 'public',
    },
    content: String,
    voice: String,
    status: String,
  },
  { timestamps: true }
);

messageSchema.index({
  content: 'text',
});

const searchPublicItems = async (
  keyword: string,
  projection: string = undefined,
  receiver: string
) => {
  const conditions: any = {
    $text: { $search: keyword },
    receiverName: receiver,
  };
  try {
    return await Message.find(conditions, projection)
      .sort({ createdAt: -1 })
      .exec();
  } catch (err) {
    throw err;
  }
};

const updateMessagesWithSender = async (
  oldSenderName: string,
  newSenderName: string
) => {
  const filter = { senderName: oldSenderName };
  const update = {
    $set: { senderName: newSenderName },
  };

  await Message.update(filter, update, { multi: true });
};

const updateMessagesWithReceiver = async (
  oldReceiverName: string,
  newReceiverName: string
) => {
  const filter = { receiverName: oldReceiverName };
  const update = {
    $set: { receiverName: newReceiverName },
  };

  await Message.update(filter, update, { multi: true });
};

messageSchema.statics.searchPublicMessages = async function searchPublicMessages(
  keyword: string,
  projection: string = undefined
) {
  return searchPublicItems(keyword, projection, 'public');
};

messageSchema.statics.searchPrivateMessages = async function searchPrivateMessages(
  searcherName: string,
  keyword: string,
  projection: string = undefined
) {
  const conditions: any = {
    $text: { $search: keyword },
    $or: [
      {
        senderName: searcherName,
        receiverName: { $nin: ['public', 'announcement'] },
      },
      { receiverName: searcherName },
    ],
  };
  try {
    return await Message.find(conditions, projection)
      .sort({ createdAt: -1 })
      .exec();
  } catch (err) {
    throw err;
  }
};

messageSchema.statics.searchAnnouncements = async function searchAnnouncements(
  keyword: string,
  numOfResults: number,
  projection: string = undefined
) {
  return searchPublicItems(keyword, projection, 'announcement');
};

messageSchema.statics.updateMessages = async function updateMessages(
  oldUsername: string,
  newUsername: string
) {
  try {
    updateMessagesWithSender(oldUsername, newUsername);
    updateMessagesWithReceiver(oldUsername, newUsername);
  } catch (err) {
    throw err;
  }
};

export const Message: IMessageModel = mongoose.model<
  IMessageDocument,
  IMessageModel
>('Message', messageSchema);
