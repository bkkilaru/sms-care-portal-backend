import request from 'supertest';
import express from 'express';
import { ObjectId } from 'mongodb';
import {
  connectDatabase,
  closeDatabase,
  clearDatabase,
  getTestToken,
} from '../../test/db';
import appointmentRouter from './appointment.api';
import { Appointment } from '../models/appointment.model';

const appointmentApp = express();

appointmentApp.use(express.urlencoded({ extended: false }));
appointmentApp.use('/', appointmentRouter);

if (process.env.NODE_ENV === 'development') {
  const tokenObject = { token: [] };
  beforeAll(async (done: any) => {
    await connectDatabase();
    await getTestToken(tokenObject, done);
  });
  beforeEach(async () => clearDatabase());
  afterAll(() => closeDatabase());

  describe('Appointment api routes work as intended', () => {
    it('appointment/ creates new appointments when all the data passed is valid', async () => {
      const res = await request(appointmentApp)
        .post('/')
        .set('Authorization', `Bearer ${tokenObject.token[0]}`)
        .type('form')
        .send({
          patientID: `${new ObjectId(1)}`,
          scheduledFor: '2121-08-03T13:47:36.413Z',
          appointmentCoachID: `${tokenObject.token[1]}`,
        });

      expect(res.statusCode).toBe(200);
      const appointments = await Appointment.find();
      expect(appointments.length).toBe(1);
      expect(`${appointments[0].scheduledByCoachID}`).toBe(
        `${tokenObject.token[1]}`,
      );
    });
    it('appointment/ returns error when date is invalid', async () => {
      const res = await request(appointmentApp)
        .post('/')
        .set('Authorization', `Bearer ${tokenObject.token[0]}`)
        .type('form')
        .send({
          patientID: `${new ObjectId(1)}`,
          scheduledFor: '1-08-03T13:47:36.413Z',
          appointmentCoachID: `${tokenObject.token[1]}`,
        });

      expect(res.statusCode).toBe(400);
      const appointments = await Appointment.find();
      expect(appointments.length).toBe(0);
    });
  });
} else {
  it('is not development', () => {
    expect(1).toBeTruthy();
  });
}
