import path from 'path';
import formidable from 'formidable';
import fs from 'fs';

import mongoose from 'mongoose';
import { MONGODB_URI } from '../config/secrets';

import { Request, Response, NextFunction } from 'express';
import { Message, IMessageDocument } from '../models/Message';
import { User, IUserDocument } from '../models/User';

import { speeh2text } from './speeh2text';

// Interface Definations
export interface IPostMessageRequest extends Request {
  files: any;
}

export interface IGetHistoryRequest extends Request {
  user: IUserDocument;
}

export interface IGetMessageRequest extends Request {
  timestamp: number;
}

export const getHistoryMessage = async (
  req: IGetHistoryRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const receiverName: string = req.params.receiverName || 'public';
    let messages: IMessageDocument[] = [];
    if (req.query.senderName === undefined) {
      messages = await Message.find({ receiverName: receiverName }).exec();
    } else {
      const requesterName = req.user.username;
      if (![receiverName, req.query.senderName].includes(requesterName)) {
        return res.status(401).json({ err: 'Unauthorized' });
      }
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
  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(__dirname, '../tmp');
  form.parse(req, async function(err, fields, files) {
    try {
      let filename = null;
      let content = fields.message;

      if (files.voice) {
        console.log(files.voice);
        filename =
          files.voice.path.split('/')[files.voice.path.split('/').length - 1] +
          '.wav';

        fs.rename(
          files.voice.path,
          path.join(form.uploadDir, filename),
          (e) => {}
        );
        const text = await speeh2text(path.join(form.uploadDir, filename));
        content = text;
      }
      const message = new Message({
        senderName: fields.senderName,
        senderId: fields.senderId,
        receiverName: fields.receiverName || 'public',
        content: content,
        voice: filename || null,
        status: fields.status,
      });

      await message.save();
      return res.status(200).json({ files });

      // return res.status(200).json('{}');
    } catch (err) {
      next(err);
    }
    // res.end(util.inspect({fields: fields, files: files}));
  });
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

export const postAnnouncement = async (
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

export const getAnnouncement = async (
  req: IGetMessageRequest,
  res: Response,
  next: NextFunction
) => {
  try {
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
