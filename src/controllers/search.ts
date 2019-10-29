import { Request, Response, NextFunction } from 'express';

export const getSearchUsersByUsername = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(200).json({});
};

export const getSearchUsersByStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(200).json({});
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
  return res.status(200).json({});
};

export const getSearchPrivateMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(200).json({});
};
