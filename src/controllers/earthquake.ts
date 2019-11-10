import { Request, Response, NextFunction } from 'express';

export const postEarthquakeReport = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.body);
};

export const postEarthquakePrediction = (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
