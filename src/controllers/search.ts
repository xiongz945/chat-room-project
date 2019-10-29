import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Message } from '../models/Message';

export const getSearchUsersByUsername = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.searchUsersByName(req.query.keyword);
    return res.status(200).json({ users: users });
  } catch (err) {
    return next(err);
  }
};

export const getSearchUsersByStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.searchUsersByStatus(req.query.keyword);
    return res.status(200).json({ users: users });
  } catch (err) {
    return next(err);
  }
};

export const getSearchAnnouncements = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(200).json({});
};

export const getSearchPublicMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const publicMsgs = await Message.searchPublicMessages(req.query.keyword);
    return res.status(200).json({'messages': publicMsgs});
  } catch(err) {
    return next(err);
  }
};

export const getSearchPrivateMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const privateMsgs = await Message.searchPrivateMessages(req.user.username, req.query.keyword);
    return res.status(200).json({'messages': privateMsgs});
  } catch(err) {
    return next(err);
  }
};
