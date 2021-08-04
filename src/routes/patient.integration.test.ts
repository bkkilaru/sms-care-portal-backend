import request from 'supertest';
import express from 'express';
import {
  connectDatabase,
  closeDatabase,
  clearDatabase,
  getTestToken,
  createPatient,
  createAppointment,
} from '../../test/db';
import { Patient } from '../models/patient.model';
import { Message } from '../models/message.model';
import patientRouter from './patient.api';

const patientApp = express();

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
    it('/:patientID/appointments route gets returns relevant appointments in order', async () => {
      const todayMinus25Hours = new Date();
      todayMinus25Hours.setDate(todayMinus25Hours.getHours() - 25);
      const patientID = '60ac2ce001d7157738425701';
      await createAppointment({
        scheduledFor: todayMinus25Hours,
        patientID,
      });
      await createAppointment({
        scheduledFor: new Date('2021-08-02T17:19:26.021Z'),
        patientID: '60ac2ce001d7157738425799',
      });
      await createAppointment({
        scheduledFor: new Date(),
        patientID,
      });
      await createAppointment({
        scheduledFor: new Date('2121-08-04T07:19:26.021Z'),
        patientID,
      });
      await createAppointment({
        scheduledFor: new Date('2121-08-01T01:19:26.021Z'),
        patientID,
      });

      const res = await request(patientApp)
        .get(`/${patientID}/appointments`)
        .set('Authorization', `Bearer ${tokenObject.token[0]}`);
      expect(res.status).toBe(200);
      let isInOrder = true;
      let lastAppointmentDate = new Date(0);
      expect(res.body.length).toBe(3);
      res?.body.forEach((appointment: any) => {
        if (new Date(appointment.scheduledFor) < lastAppointmentDate) {
          isInOrder = false;
        }
        if (!lastAppointmentDate) {
          lastAppointmentDate = appointment.scheduledFor;
        }
      });
      expect(isInOrder).toBeTruthy();
    });
    it('/:patientID/appointments route handles invalid patientID', async () => {
      const patientID = '2ff';

      const res = await request(patientApp)
        .get(`/${patientID}/appointments`)
        .set('Authorization', `Bearer ${tokenObject.token[0]}`);
      expect(res.status).toBe(400);
    });
  });
} else {
  it('is not development', () => {
    expect(1).toBeTruthy();
  });
}
