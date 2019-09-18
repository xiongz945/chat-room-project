import mongoose from 'mongoose';

export type MessageDocument = mongoose.Document & {
  senderName: String;
  senderId: String;
  reciverId?: String;
  content: String;
  createdAt: Date;
  updatedAt: Date;
};

const messageSchema = new mongoose.Schema(
  {
    senderName: String,
    senderId: String,
    reciverId: {
      type: String,
      required: false,
      default: undefined,
    },
    content: String,
  },
  { timestamps: true }
);

export const Message = mongoose.model<MessageDocument>(
  'Message',
  messageSchema
);
