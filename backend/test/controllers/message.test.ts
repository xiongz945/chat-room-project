import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import * as msgController from '../../src/controllers/messages';

​
import {Message} from '../../src/models/Message';
import {MONGODB_URI} from '../../src/config/secrets';
​
const MONGODB_URI_TEST = MONGODB_URI + "test_message";
​
describe('Test Message Controller', () => {
​
  beforeAll( async() => {
    mongoose
    .connect(MONGODB_URI_TEST, { useNewUrlParser: true })
    .then(() => {
    })
    .catch((err) => {
      console.log(err);
    });
​
    const message = new Message({senderName: 'abc', senderId: '123', content: "Testing", receiverId: "public", createdAt: "2019-09-30T19:37:46.495Z"});
    await message.save();
  })
​
  afterAll( async() => {
    await mongoose.connection.db.dropDatabase();
  })

  test('getHistoryMessage() - return history message within specified window', async () => {
    const req: any = {
        query: {
            start: 0,
            end: 10
        }
      };
    const res: any = {
        status: jest.fn((code) => {
            return res;
        }),
        json: jest.fn((resp: any) => {
            resp.messages[0] = resp.messages[0].toObject();
            delete resp.messages[0].createdAt;
            delete resp.messages[0].__v;
            delete resp.messages[0]._id;
            delete resp.messages[0].senderId;
            delete resp.messages[0].updatedAt;
            return res;
        })
        };
    const next = jest.fn();

    await msgController.getHistoryMessage(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
        messages: [{
        senderName: 'abc', 
        content: "Testing", 
        receiverId: "public", 
    }]});
    
  })

  test('postMessage() - post a new message', async () => {
    const req: any = {
        body: {
            senderName: 'def',
            senderId: '456',
            message: "Testing again"
        }
      };
    const res: any = {
        status: jest.fn((code) => {
            return res;
        }),
        json: jest.fn((payload) => {
            return res;
        }),
        };
    const next = jest.fn();

    await msgController.postMessage(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith('{}');

    });

    test('getMessage() - get a new message', async () => {
        const req: any = {
            query: {
                timestamp: "2019-09-30T19:37:46.495Z",
            }
          };
        const res: any = {
            status: jest.fn((code) => {
                return res;
            }),
            json: jest.fn((resp: any) => {
                for (let i=0; i<resp.messages.length; i++) {
                    resp.messages[i] = resp.messages[i].toObject();
                    delete resp.messages[i].createdAt;
                    delete resp.messages[i].senderId;
                    delete resp.messages[i].__v;
                    delete resp.messages[i]._id;
                    delete resp.messages[i].updatedAt; 
                }
                return res;
            }),
            };
        const next = jest.fn();

        await msgController.getMessage(req, res, next);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            messages: [{
                senderName: 'abc', 
                content: "Testing",
                receiverId: "public"
            }, 
            {
                senderName: 'def', 
                content: "Testing again",
                receiverId: "public"
            }
            ]
        });

    });
})