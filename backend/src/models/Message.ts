import mongoose from 'mongoose';

export type MessageDocument = mongoose.Document & {
  senderName: String;
  receiverName: String;
  content: String;
  createdAt: Date;
  updatedAt: Date;
};

const messageSchema = new mongoose.Schema(
  {
    senderName: String,
    receiverName: {
      type: String,
      default: 'public',
    },
    content: String,
  },
  { timestamps: true }
);

export const Message = mongoose.model<MessageDocument>(
  'Message',
  messageSchema
);
