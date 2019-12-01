import { Request, Response, NextFunction } from 'express';
import { Location, ILocationDocument } from '../models/Location';

export interface IPostLocationRequest extends Request {
  username: string;
  location: string;
  status: string;
  desc: string;
}

export interface IGetLocationRequest extends Request {
  username: string;
}

export const getLocation = async (
  req: IGetLocationRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const timestamp: Date = new Date(parseInt(req.query.timestamp));
    const location: any = await Location.getLocation(
      req.params.name,
      timestamp
    );
    return res.status(200).json({ location });
  } catch (err) {
    return next(err);
  }
};

export const getAllLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const locations: ILocationDocument[] = await Location.getAllLocation();
    return res.status(200).json({ locations: locations });
  } catch (err) {
    return next(err);
  }
};

export const postNewLocation = async (
  req: IPostLocationRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const location = Location.createNewLocation(
      req.params.name,
      req.body.location,
      req.body.placeid,
      req.body.status,
      req.body.desc
    );
    return res.status(200).json('{}');
  } catch (err) {
    return next(err);
  }
};

export const getComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
  } catch (err) {
    return next(err);
  }
};

export const postNewComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
  } catch (err) {
    return next(err);
  }
};
