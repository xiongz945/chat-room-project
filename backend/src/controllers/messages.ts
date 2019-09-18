import { Request, Response, NextFunction } from 'express';
import { Message, MessageDocument } from '../models/Message';

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
