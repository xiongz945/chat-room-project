import { Request, Response, NextFunction } from 'express';
import { Message, MessageDocument } from '../models/Message';

import socket from 'socket.io';
import io from '../server';
import request from 'request';

// Interface Definations
export interface IPostMessageRequest extends Request {
  message: string;
  senderName: string;
  senderId: string;
}

export interface IGetMessageRequest extends Request {
  timestamp: number;
}

export const getHistoryMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const receiverName: string = req.params.receiverName || 'public';
    let messages: MessageDocument[] = await Message.find({ receiverName }).exec();

    const messageLength = messages.length;
    messages = messages.slice(
      messageLength - req.query.end,
      messageLength - req.query.start
    );
    return res.status(200).json({ messages });
  } catch (err) {
    return next(err);
  }
};

export const postMessage = async (
  req: IPostMessageRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const message = new Message({
      senderName: req.body.senderName,
      senderId: req.body.senderId,
      receiverName: req.params.receiverName || 'public',
      content: req.body.message,
    });
    await message.save();
    return res.status(200);
  } catch (err) {
    next(err);
  }
};

export const getMessage = async (
  req: IGetMessageRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const timestamp: Date = new Date(parseInt(req.query.timestamp));
    const messages: any = await Message.find({
      receiverName: req.params.receiverName || 'public',
      createdAt: { $gte: timestamp },
    }).exec();
    return res.status(200).json({ messages });
  } catch (err) {
    return next(err);
  }
};
