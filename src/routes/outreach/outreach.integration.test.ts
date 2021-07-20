import request from 'supertest';
import express, { response } from 'express';
import {
  connectDatabase,
  closeDatabase,
  clearDatabase,
  getTestToken,
  createPatient,
} from '../../../test/db';
import { Patient } from '../../models/patient.model';
import { Message } from '../../models/message.model';
import { getResponses } from './outreachResponses';

if (process.env.NODE_ENV === 'development') {
  const tokenObject = { token: [] };
  beforeAll(async (done: any) => {
    await connectDatabase();
    await getTestToken(tokenObject, done);
  });
  beforeEach(async () => clearDatabase());
  afterAll(() => closeDatabase());

  describe('Twilio api integration properly handles messages', () => {
    it('outreach responses return defaulr responses appropiately', async () => {
      await createPatient('0123456789');
      const patient = await Patient.findOne();
      let responsesZero = [];
      let responsesOne = [];
      let responsesTwo = [];
      let responsesYes = [];
      if (patient) {
        responsesZero = getResponses('english', 'zero', patient);
        responsesOne = getResponses('english', 'one', patient);
        responsesTwo = getResponses('english', 'two', patient);
        responsesYes = getResponses('english', 'yes', patient);
      }

      expect(responsesZero.length).toBe(4);
      expect(responsesOne.length).toBe(5);
      expect(responsesTwo.length).toBe(3);
      expect(responsesYes.length).toBe(1);
    });
  });
} else {
  it('is not development', () => {
    expect(1).toBeTruthy();
  });
}
