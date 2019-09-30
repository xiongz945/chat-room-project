import { Request, Response, NextFunction } from 'express';
import { Message } from '../models/Message';

import socket from 'socket.io';
import io from '../server';

// Interface Definations
export interface IPostMessageRequest extends Request {
  message: string;
  senderName: string;
  senderId: string;
}

export interface IGetMessageRequest extends Request {
  timestamp: number;
}

export const getHistoryMessage = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const query: any = req.query;
  Message.find({}, function(err, messages) {
    const messageLength = messages.length;
    messages = messages.slice(
      messageLength - query.end,
      messageLength - query.start
    );
    return res.status(200).json({ messages });
  });
};

export const postMessage = (
  req: IPostMessageRequest,
  res: Response,
  next: NextFunction
) => {
  const message = new Message({
    senderName: req.body.senderName,
    senderId: req.body.senderId,
    reciverId: 'public',
    content: req.body.message,
  });
  message.save();
  console.log(message);

  // Add log for io connection
  // io.on('connection', function() {
  // io.emit('PULL_NEW_MESSAGE', 'public');
  // })

  return res.status(200).json('{}');
};

export const getMessage = (
  req: IGetMessageRequest,
  res: Response,
  next: NextFunction
) => {
  const timestamp: Date = new Date(parseInt(req.query.timestamp));
  Message.find(
    { reciverId: 'public', createdAt: { $gte: timestamp } },
    function(err, messages) {
      //console.log(messages);
      return res.status(200).json({ messages });
    }
  );
};
