import { Request, Response, NextFunction } from 'express';
import { Message } from '../models/Message';
import { HospitalInfo } from '../models/HospitalInfo';

import socket from 'socket.io';
import io from '../server';
import request from 'request';

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

const crawlHospitalList = async (
  location: String
) => {
  /*
const request = require('request');

request('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY', { json: true }, (err, res, body) => {
  if (err) { return console.log(err); }
  console.log(body.url);
  console.log(body.explanation);
});
  */
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

    const location = req.body.location;

    // Call smart assistant core.
    const hospital = new HospitalInfo({
      lonlat: '1,2',
      address: 'abc',
      category: 'abc',
      name: 'abc',
    });
    await hospital.save();

    const response = new Message({
      senderName: 'smart-assistant',
      receiverName: req.body.senderName,
      content: req.body.message,
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
