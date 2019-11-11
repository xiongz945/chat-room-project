import { Request, Response, NextFunction } from 'express';
import {
  EarthquakeReport,
  IEarthquakeReportDocument,
} from '../models/EarthquakeReport';

export const postEarthquakeReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = req.body;
    payload['reporterName'] = req.user.username;
    const earthquakeReport = new EarthquakeReport(payload);
    await earthquakeReport.save();
    return res.status(200).json({});
  } catch (err) {
    next(err);
  }
};

export const getEarthquakeReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reports: IEarthquakeReportDocument[] = await EarthquakeReport.getAllReports();
    return res.status(200).json({ reports: reports });
  } catch (err) {
    next(err);
  }
};

export const postEarthquakePrediction = (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
