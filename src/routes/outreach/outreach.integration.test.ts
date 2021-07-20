import {
  connectDatabase,
  closeDatabase,
  clearDatabase,
  getTestToken,
  createPatient,
} from '../../../test/db';
import { Patient } from '../../models/patient.model';
import { Message } from '../../models/message.model';
import outreachMessage from './outreachResponses';

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
      await createPatient('0123456789', {
        enabled: true,
        yes: false,
        complete: false,
        lastMessageSent: '0',
        lastDate: new Date(),
      });

      const sendOutreachMessagesAndReturnUpdatedData = async () => {
        let patient = await Patient.findOne();
        if (patient) {
          await outreachMessage(patient);
        }
        const messages = await Message.find();
        patient = await Patient.findOne();
        return { messages, patient };
      };

      let { messages, patient } =
        await sendOutreachMessagesAndReturnUpdatedData();
      expect(messages.length).toBe(4);
      expect(messages[0]?.message.includes('your team at')).toBeTruthy();
      expect(patient?.outreach.lastMessageSent).toBe('1');

      ({ messages, patient } =
        await sendOutreachMessagesAndReturnUpdatedData());
      expect(messages.length).toBe(7);
      expect(messages[4]?.message.includes('Great!')).toBeTruthy();
      expect(patient?.outreach.lastMessageSent).toBe('2');

      ({ messages, patient } =
        await sendOutreachMessagesAndReturnUpdatedData());
      expect(messages.length).toBe(10);
      expect(messages[7]?.message.includes('Wonderful!')).toBeTruthy();
      expect(patient?.outreach.lastMessageSent).toBe('3');

      ({ messages, patient } =
        await sendOutreachMessagesAndReturnUpdatedData());
      expect(messages.length).toBe(11);
      expect(
        messages[10]?.message.includes('Welcome to Healthy at Home!'),
      ).toBeTruthy();
      expect(patient?.outreach.lastMessageSent).toBe('yes');
    });
  });
} else {
  it('is not development', () => {
    expect(1).toBeTruthy();
  });
}
