import mongoose from 'mongoose';

export type ChatroomDocument = mongoose.Document & {
  users: [{ type: mongoose.Types.ObjectId; ref: 'User' }];
  to: String;
  content: String;
};

const chatroomSchema = new mongoose.Schema(
  {
    users: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    to: String,
    content: String,
  },
  { timestamps: true }
);

export const Chatroom = mongoose.model<ChatroomDocument>(
  'Chatroom',
  chatroomSchema
);
