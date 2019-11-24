import { Request, Response, NextFunction } from 'express';
import { Message } from '../models/Message';
import { HospitalInfo } from '../models/HospitalInfo';
import { matchQuestion } from '../util/fuzzing';
import apiKey from '../config/mapBoxApiKey.json';
import chatData from '../config/chatData.json';
import axios from 'axios';

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

const crawlHospitalList = async (location: string) => {
  const cache = await HospitalInfo.searchHospitals(location);
  if (cache !== undefined && cache.length > 0) {
    return;
  }

  const base =
    'https://api.mapbox.com/geocoding/v5/mapbox.places/hospital.json';
  const url = `${base}?access_token=${apiKey['key']}&proximity=${location}`;

  const resp = await axios.get(url);
  const features = resp['data']['features'];

  for (let i = 0; i < features.length; ++i) {
    const feature = features[i];

    const name = feature['text'];
    const address = feature['properties']['address'];
    const longlat = feature['center'][0] + ',' + feature['center'][1];
    const category = feature['properties']['category'];

    const hospital = new HospitalInfo({
      center: location,
      longlat: longlat,
      address: address,
      category: category,
      name: name,
    });
    await hospital.save();
  }
};

export const postRequest = async (
  req: IPostMessageRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const request = new Message({
      senderName: req.body.senderName,
      receiverName: 'smart-assistant',
      content: req.body.message,
      status: req.body.status,
    });
    await request.save();

    let match = matchQuestion(req.body.message, chatData);
    if (match === '') {
      match = "Sorry! I don't get you...";
    } else {
      await crawlHospitalList(req.body.location);
    }

    const response = new Message({
      senderName: 'smart-assistant',
      receiverName: req.body.senderName,
      content: match,
    });
    await response.save();

    return res.status(200).json('{}');
  } catch (err) {
    next(err);
  }
};

export const getResponse = async (
  req: IGetMessageRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const messages: any = await Message.find({
      senderName: req.query.senderName,
      receiverName: req.query.receiverName,
    })
      .sort({ createdAt: -1 })
      .limit(1)
      .exec();

    return res.status(200).json({ messages });
  } catch (err) {
    return next(err);
  }
};

export const getHospitalInfo = async (
  req: IGetMessageRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const hospitals: any = await HospitalInfo.searchHospitals(
      req.query.location
    );
    return res.status(200).json({ hospitals });
  } catch (err) {
    return next(err);
  }
};
