import request from 'supertest';
import express from 'express';
import {
  connectDatabase,
  closeDatabase,
  clearDatabase,
  getTestToken,
  createPatient,
} from '../../../test/db';
import twilioRouter from './twilio.api';
import { Patient } from '../../models/patient.model';
import { Message } from '../../models/message.model';
import { Outcome } from '../../models/outcome.model';

const twilioApp = express();

twilioApp.use(express.urlencoded({ extended: false }));
twilioApp.use('/', twilioRouter);

if (process.env.NODE_ENV === 'development') {
  const tokenObject = { token: [] };
  beforeAll(async (done: any) => {
    await connectDatabase();
    await getTestToken(tokenObject, done);
  });
  beforeEach(async () => clearDatabase());
  afterAll(() => closeDatabase());

  describe('Twilio api integration properly handles messages', () => {
    it('sendMessage route saves message with sender COACH and coaching number ', async () => {
      await createPatient('0123456789');
      const patient = await Patient.findOne({ phoneNumber: '0123456789' });
      const res = await request(twilioApp)
        .post('/sendMessage')
        .set('Authorization', `Bearer ${tokenObject.token[0]}`)
        .type('form')
        .send({
          message: 'Test message',
          to: 'test number',
          patientID: `${patient?._id}`,
        });
      expect(res.statusCode).toBe(200);
      const message = await Message.findOne();
      expect(message?.sender).toBe('COACH');
      expect(message?.isCoachingMessage).toBe(true);
    });

    it('receive route saves incoming message from a known patient to Message database with coaching number', async () => {
      await createPatient('1114446668');
      const patient = await Patient.findOne();
      const res = await request(twilioApp)
        .post('/receive')
        .type('form')
        .send({
          Body: 'Test message',
          From: '001114446668',
          patientID: `${patient?._id}`,
        });
      expect(res.statusCode).toBe(200);
      const messages = await Message.findOne();
      const outcome = await Outcome.find();
      expect(outcome.length).toBe(0);
      expect(messages?.isCoachingMessage).toBe(true);
      expect(messages?.sender).toBe('PATIENT');
    });

    it('reply route saves incoming message from a known patient to Message and creates new outcome', async () => {
      await createPatient('1114446668');
      const patient = await Patient.findOne();
      const res = await request(twilioApp)
        .post('/reply')
        .type('form')
        .send({
          Body: 'Test message 88',
          From: '001114446668',
          patientID: `${patient?._id}`,
        });
      expect(res.statusCode).toBe(204);
      const messages = await Message.find();
      const outcome = await Outcome.find();
      expect(messages[0]?.isCoachingMessage).toBe(false);
      expect(messages[0]?.sender).toBe('PATIENT');
      expect(messages[1]?.isCoachingMessage).toBe(false);
      expect(messages[1]?.sender).toBe('BOT');
      expect(outcome.length).toBe(1);
      expect(outcome[0].phoneNumber).toBe('1114446668');
    });

    it('reply route receives bad incoming message from a known patient and sends an error message', async () => {
      await createPatient('1114446668');
      const patient = await Patient.findOne();
      const res = await request(twilioApp)
        .post('/reply')
        .type('form')
        .send({
          Body: 'Im not feeling well coach',
          From: '001114446668',
          patientID: `${patient?._id}`,
        });
      expect(res.statusCode).toBe(204);
      const messages = await Message.find();
      const outcome = await Outcome.find();
      expect(messages[0]?.sender).toBe('PATIENT');
      expect(messages[1]?.isCoachingMessage).toBe(false);
      expect(messages[1]?.sender).toBe('BOT');
      expect(messages[1]?.message).toContain('(650) 534-0331');
      expect(outcome.length).toBe(0);
    });
  });

  describe('Twilio.functions.ts error handling works as intended', () => {
    it('receive route catches if it gets wrong number argument ', async () => {
      await createPatient('1114446668');
      const patient = await Patient.findOne();
      const res = await request(twilioApp)
        .post('/receive')
        .set('Authorization', `Bearer ${tokenObject.token[0]}`)
        .type('form')
        .send({
          Body: '',
          From: '',
          patientID: `${patient?._id}`,
        });
      expect(res.statusCode).toBe(200);
      const messages = await Message.find();
      expect(messages.length).toBe(0);
    });

    it('reply route catches if it gets wrong patient ', async () => {
      const res = await request(twilioApp)
        .post('/receive')
        .set('Authorization', `Bearer ${tokenObject.token[0]}`)
        .type('form')
        .send({
          Body: '',
          From: '001114446668',
          patientID: '',
        });
      expect(res.statusCode).toBe(200);
      const messages = await Message.find();
      expect(messages.length).toBe(0);
    });
  });
  describe('Twilio api Sends outreach messages if it receives YES or MORE', () => {
    it('sends YES messages if the patient says YES.', async () => {
      await createPatient('1112223334', {
        enabled: true,
        patientRequestedContact: false,
        yes: false,
        complete: false,
        lastTemplateSent: 'zero',
        lastDate: new Date(),
      });
      const patient = await Patient.findOne({ phoneNumber: '1112223334' });
      const res = await request(twilioApp)
        .post('/receive')
        .type('form')
        .send({
          Body: 'YES',
          From: '001112223334',
          patientID: `${patient?._id}`,
        });
      expect(res.statusCode).toBe(200);
      const Messages = await Message.find();
      const updatedPatient = await Patient.findOne({
        phoneNumber: '1112223334',
      });
      expect(Messages.length).toBe(2);
      expect(Messages[1].message.includes('By joining,')).toBeTruthy();
      expect(updatedPatient?.outreach.lastTemplateSent).toBe(
        'patientContactMessageSent',
      );
      const secondRes = await request(twilioApp)
        .post('/receive')
        .type('form')
        .send({
          Body: 'YES',
          From: '001112223334',
          patientID: `${patient?._id}`,
        });
      const messagesAfterTwoYES = await Message.find();
      const updatedPatientAfterTwoYES = await Patient.findOne({
        phoneNumber: '1112223334',
      });
      expect(secondRes.statusCode).toBe(200);
      expect(messagesAfterTwoYES.length).toBe(3);
      expect(updatedPatientAfterTwoYES?.outreach.lastTemplateSent).toBe(
        'patientContactMessageSent',
      );
    });
    it('sends MORE messages if the patient says MORE', async () => {
      await createPatient('1112223334', {
        enabled: true,
        patientRequestedContact: false,
        yes: false,
        complete: false,
        lastDate: new Date(),
        lastTemplateSent: 'first',
      });
      const patient = await Patient.findOne({ phoneNumber: '1112223334' });
      const res = await request(twilioApp)
        .post('/receive')
        .type('form')
        .send({
          Body: 'MORE',
          From: '001112223334',
          patientID: `${patient?._id}`,
        });
      expect(res.statusCode).toBe(200);
      const Messages = await Message.find();
      expect(Messages.length).toBe(4);
      expect(Messages[1].message.includes('Great! We’ve helped')).toBeTruthy();
      const resSecond = await request(twilioApp)
        .post('/receive')
        .type('form')
        .send({
          Body: 'MORE',
          From: '001112223334',
          patientID: `${patient?._id}`,
        });
      expect(resSecond.statusCode).toBe(200);
      const resThird = await request(twilioApp)
        .post('/receive')
        .type('form')
        .send({
          Body: 'MORE',
          From: '001112223334',
          patientID: `${patient?._id}`,
        });
      expect(resThird.statusCode).toBe(200);
      const updatedPatientAfterEnrollingBySendingMOREMessages =
        await Patient.findOne({
          phoneNumber: '1112223334',
        });
      expect(
        updatedPatientAfterEnrollingBySendingMOREMessages?.outreach
          .lastTemplateSent,
      ).toBe('patientContactMessageSent');
    });
  });
} else {
  it('is not development', () => {
    expect(1).toBeTruthy();
  });
}
