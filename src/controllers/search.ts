import { Request, Response, NextFunction } from 'express';
import { User, IUserDocument } from '../models/User';
import { Message } from '../models/Message';

export interface IGetSearchByUsernameRequest extends Request {}

export interface IGetSearchByStatusRequest extends Request {}

export interface IGetSearchAnnouncementRequest extends Request {}

export interface IGetSearchPublicMessageRequest extends Request {}

export interface IGetSearchPrivateMessageRequest extends Request {
  user: IUserDocument;
}

export const getSearchUsersByUsername = async (
  req: IGetSearchByUsernameRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.searchUsersByName(
      req.query.keyword,
      'username isOnline status'
    );
    return res.status(200).json({ users: users });
  } catch (err) {
    return next(err);
  }
};

export const getSearchUsersByStatus = async (
  req: IGetSearchByStatusRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.searchUsersByStatus(
      req.query.keyword,
      'username isOnline status'
    );
    return res.status(200).json({ users: users });
  } catch (err) {
    return next(err);
  }
};

export const getSearchAnnouncements = async (
  req: IGetSearchAnnouncementRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const announcements = await Message.searchAnnouncements(
      req.query.keyword,
      10,
      'senderName content createdAt'
    );
    return res.status(200).json({ announcement: announcements });
  } catch (err) {
    return next(err);
  }
};

export const getSearchPublicMessages = async (
  req: IGetSearchPublicMessageRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const publicMsgs = await Message.searchPublicMessages(
      req.query.keyword,
      'senderName content status createdAt'
    );
    return res.status(200).json({ messages: publicMsgs });
  } catch (err) {
    return next(err);
  }
};

export const getSearchPrivateMessages = async (
  req: IGetSearchPrivateMessageRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const privateMsgs = await Message.searchPrivateMessages(
      req.user.username,
      req.query.keyword,
      'senderName receiverName content status createdAt'
    );
    return res.status(200).json({ messages: privateMsgs });
  } catch (err) {
    return next(err);
  }
};
