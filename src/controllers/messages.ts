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
  status: string;
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

    let messages: MessageDocument[] = [];
    if (req.query.senderName === undefined) {
      messages = await Message.find({ receiverName: receiverName }).exec();
    } else {
      messages = await Message.find({
        senderName: req.query.senderName,
        receiverName: receiverName,
      }).exec();
    }

    const messageLength = messages.length;
    messages = messages.slice(
      Math.max(messageLength - req.query.end, 0),
      Math.max(messageLength - req.query.start, 0)
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
      status: req.body.status,
    });
    await message.save();
    return res.status(200).json('{}');
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

    if (req.params.senderName === undefined) {
      const messages: any = await Message.find({
        receiverName: req.params.receiverName || 'public',
        createdAt: { $gte: timestamp },
      }).exec();
      return res.status(200).json({ messages });
    } else {
      const messages: any = await Message.find({
        senderName: req.params.senderName,
        receiverName: req.params.receiverName || 'public',
        createdAt: { $gte: timestamp },
      }).exec();
      return res.status(200).json({ messages });
    }
  } catch (err) {
    return next(err);
  }
};

export const postAnnouncment = async (
  req: IPostMessageRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const announcement = new Message({
      senderName: req.body.senderName,
      senderId: req.body.senderId,
      receiverName: 'announcement',
      content: req.body.message,
      status: '',
    });
    await announcement.save();
    return res.status(200).json('{}');
  } catch (err) {
    next(err);
  }
};

export const getAnnouncment = async (
  req: IGetMessageRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const timestamp: Date = new Date(parseInt(req.query.timestamp));

    if (req.params.receiverName !== 'announcement')
      return res
        .status(400)
        .json({ error: 'You are posting message to announcement channel' });

    const announcements: any = await Message.find({
      receiverName: 'announcement',
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .exec();
    return res.status(200).json({ announcements });
  } catch (err) {
    return next(err);
  }
};
