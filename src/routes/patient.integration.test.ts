import request from 'supertest';
import express from 'express';
import {
  connectDatabase,
  closeDatabase,
  clearDatabase,
  getTestToken,
  createPatient,
} from '../../test/db';
import { Patient } from '../models/patient.model';
import { Message } from '../models/message.model';
import patientRouter from './patient.api';

const patientApp = express();
patientApp.use(express.json());
patientApp.use(express.urlencoded({ extended: false }));
patientApp.use('/', patientRouter);

if (process.env.NODE_ENV === 'development') {
  const tokenObject = { token: [] };
  beforeAll(async (done: any) => {
    await connectDatabase();
    await getTestToken(tokenObject, done);
  });
  beforeEach(async () => clearDatabase());
  afterAll(() => closeDatabase());

  describe('Patient api routes work as intended', () => {
    it('getPatientMessages/:patientID route gets coaching messages only', async () => {
      await createPatient('1114446668');
      const patient = await Patient.findOne();
      const newMessage = new Message({
        phoneNumber: patient?.phoneNumber,
        patientID: patient?._id,
        sender: 'COACH',
        message: 'Example smg',
        date: new Date(),
        sent: true,
        isCoachingMessage: true,
      });
      await newMessage.save();
      const newMessageNotShow = new Message({
        phoneNumber: patient?.phoneNumber,
        patientID: patient?._id,
        sender: 'COACH',
        message: 'Example smg',
        date: new Date(),
        sent: false,
        isCoachingMessage: true,
      });
      await newMessageNotShow.save();
      const newMessageNotShow2 = new Message({
        phoneNumber: patient?.phoneNumber,
        patientID: patient?._id,
        sender: 'COACH',
        message: 'Example smg',
        date: new Date(),
        sent: true,
        isCoachingMessage: false,
      });
      await newMessageNotShow2.save();
      const res = await request(patientApp)
        .get(`/getPatientMessages/${patient?._id}`)
        .set('Authorization', `Bearer ${tokenObject.token[0]}`);

      expect(res.statusCode).toBe(200);
      const messages = res.body;
      expect(messages.length).toBe(1);
      expect(messages[0]?.sender).toBe('COACH');
      expect(messages[0]?.isCoachingMessage).toBe(true);
    });
    it('Sends an outreach message when a patient is created and outreach is turned on', async () => {
      const res = await request(patientApp)
        .post('/add')
        .set('Authorization', `Bearer ${tokenObject.token[0]}`)
        .send({
          firstName: 'outreach test',
          lastName: 'test',
          language: 'english',
          phoneNumber: '0123456789',
          coachId: '60ac2a4b01d7157738425700',
          isEnabled: true,
          msgTime: '13:33',
          coachName: 'Test Testingson',
          clinic: 'Call me coahc',
          outreach: {
            enabled: true,
            yes: false,
            complete: false,
          },
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');
      expect(res.statusCode).toBe(200);
      const messages = await Message.find();
      expect(messages[0].message).toBe(
        'Hi outreach test, your team at Call me coahc 🏥 referred you to join the Healthy At Home Program. This is Test Testingson and I can tell you more.',
      );
      expect(messages[3].message).toBe(
        'Want to join for FREE? Respond YES to get set up with your diabetes coach or MORE to learn more.',
      );
      expect(messages.length).toBe(4);
      expect(messages[2].isCoachingMessage).toBeTruthy();
      const updatedPatient = await Patient.findOne();
      expect(updatedPatient?.outreach.lastMessageSent).toBe('1');
      expect(updatedPatient?.outreach.enabled).toBe(true);
      expect(updatedPatient?.outreach.yes).toBe(false);
      expect(updatedPatient?.outreach.complete).toBe(false);
    });
  });
} else {
  it('is not development', () => {
    expect(1).toBeTruthy();
  });
}
