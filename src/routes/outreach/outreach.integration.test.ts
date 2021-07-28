import {
  connectDatabase,
  closeDatabase,
  clearDatabase,
  getTestToken,
  createPatient,
} from '../../../test/db';
import { Patient } from '../../models/patient.model';
import { Message } from '../../models/message.model';
import sendOutreachMessages from './outreachMessagesLogic';

if (process.env.NODE_ENV === 'development') {
  const tokenObject = { token: [] };
  beforeAll(async (done: any) => {
    await connectDatabase();
    await getTestToken(tokenObject, done);
  });
  beforeEach(async () => clearDatabase());
  afterAll(() => closeDatabase());

  describe('Twilio api integration properly handles messages', () => {
    it('outreach messages return default messages appropiately', async () => {
      await createPatient('0123456789', {
        enabled: true,
        yes: false,
        complete: false,
        lastTemplateSent: 'zero',
        lastDate: new Date(),
      });

      const sendOutreachMessagesAndReturnUpdatedData = async () => {
        let patient = await Patient.findOne();
        if (patient) {
          await sendOutreachMessages({ patient });
        }
        const messages = await Message.find();
        patient = await Patient.findOne();
        return { messages, patient };
      };

      let { messages, patient } =
        await sendOutreachMessagesAndReturnUpdatedData();
      expect(messages.length).toBe(4);
      expect(messages[0].message).toBe(
        `Hi ${patient?.firstName} ${patient?.lastName}, your team at ${patient?.clinic} 🏥 referred you to join the Healthy At Home Program. This is ${patient?.coachName} and I can tell you more.`,
      );
      expect(patient?.outreach.lastTemplateSent).toBe('first');

      ({ messages, patient } =
        await sendOutreachMessagesAndReturnUpdatedData());
      expect(messages.length).toBe(7);
      expect(messages[4].message.includes('Great!')).toBeTruthy();
      expect(messages[4]?.publicImagesURLs?.length).toBe(2);
      expect(messages[5].message.includes('Here’s how it works')).toBeTruthy();
      expect(messages[5]?.publicImagesURLs?.length).toBe(0);
      expect(patient?.outreach.lastTemplateSent).toBe('second');

      ({ messages, patient } =
        await sendOutreachMessagesAndReturnUpdatedData());
      expect(messages.length).toBe(10);
      expect(messages[7]?.message.includes('Wonderful!')).toBeTruthy();
      expect(messages[9]?.message.includes('Give it a try')).toBeTruthy();
      expect(patient?.outreach.lastTemplateSent).toBe(
        'patientRequestedContact',
      );

      ({ messages, patient } =
        await sendOutreachMessagesAndReturnUpdatedData());
      expect(messages.length).toBe(11);
      expect(
        messages[10]?.message.includes('Welcome to Healthy at Home!'),
      ).toBeTruthy();
      expect(patient?.outreach.lastTemplateSent).toBe(
        'patientContactMessageSent',
      );

      ({ messages, patient } =
        await sendOutreachMessagesAndReturnUpdatedData());
      expect(messages.length).toBe(11);
      expect(
        messages[10]?.message.includes('Welcome to Healthy at Home!'),
      ).toBeTruthy();
      expect(patient?.outreach.lastTemplateSent).toBe(
        'patientContactMessageSent',
      );
    });
  });
} else {
  it('is not development', () => {
    expect(1).toBeTruthy();
  });
}
