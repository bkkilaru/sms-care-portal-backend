import request from 'supertest';
import express from 'express';
import { ObjectId } from 'mongodb';
import {
  connectDatabase,
  closeDatabase,
  clearDatabase,
  getTestToken,
  createAppointment,
} from '../../test/db';
import coachRouter from './coach.api';

const coachApp = express();

coachApp.use(express.urlencoded({ extended: false }));
coachApp.use('/', coachRouter);

if (process.env.NODE_ENV === 'development') {
  const tokenObject = { token: [] };
  beforeAll(async (done: any) => {
    await connectDatabase();
    await getTestToken(tokenObject, done);
  });
  beforeEach(async () => clearDatabase());
  afterAll(() => closeDatabase());

  describe('Coach routes testing', () => {
    it('/appointments returns coach appointments in order', async () => {
      const patientID = '60ac2ce001d7157738425701';

      await createAppointment({
        scheduledFor: new Date('2121-08-02T17:19:26.021Z'),
        patientID,
        appointmentCoachID: tokenObject.token[1],
      });
      await createAppointment({
        scheduledFor: new Date('2121-08-02T19:19:26.021Z'),
        patientID,
        appointmentCoachID: tokenObject.token[1],
      });

      await createAppointment({
        scheduledFor: new Date('2121-08-01T07:19:26.021Z'),
        patientID,
        appointmentCoachID: tokenObject.token[1],
      });

      await createAppointment({
        scheduledFor: new Date('1999-08-02T19:19:26.021Z'),
        patientID,
        appointmentCoachID: tokenObject.token[1],
      });

      await createAppointment({
        scheduledFor: new Date('2021-08-01T01:19:26.021Z'),
        patientID,
        appointmentCoachID: `${new ObjectId(23123)}`,
      });

      const res = await request(coachApp)
        .get('/appointments')
        .set('Authorization', `Bearer ${tokenObject.token[0]}`);
      expect(res.status).toBe(200);
      let isInOrder = true;
      let lastAppointmentDate = new Date(0);
      expect(res?.body.length).toBe(3);
      res?.body.forEach((appointment: any) => {
        if (
          new Date(appointment.scheduledFor) < new Date(lastAppointmentDate)
        ) {
          isInOrder = false;
        }
        lastAppointmentDate = appointment.scheduledFor;
      });
      expect(isInOrder).toBeTruthy();
    });
  });
} else {
  it('is not development', () => {
    expect(1).toBeTruthy();
  });
}
