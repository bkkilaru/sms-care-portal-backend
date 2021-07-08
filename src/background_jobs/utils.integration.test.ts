import {
  connectDatabase,
  closeDatabase,
  clearDatabase,
  createPatient,
} from '../../test/db';
import { Message } from '../models/message.model';
import { outreachNoResponseSendNextMessage } from './utils';

if (process.env.NODE_ENV === 'development') {
  beforeAll(async () => {
    await connectDatabase();
  });
  beforeEach(async () => clearDatabase());
  afterAll(() => closeDatabase());

  describe('Outreach sends new messages round after one day of inactivity by the user', () => {
    it('Outreach sends "MORE" Messages after 24 hours of inactivity by the user', async () => {
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 25);
      await createPatient('1112223334', {
        outreach: true,
        yes: false,
        complete: false,
        lastMessageSent: '1',
        lastDate: yesterday,
      });
      await outreachNoResponseSendNextMessage();
      const messages = await Message.find();
      expect(messages.length).toBe(5);
    });
    it('Outreach sends "YES" Messages after 72 hours of inactivity by the user or 24 after last "MORE" message', async () => {
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 25);
      await createPatient('1112223334', {
        outreach: true,
        yes: false,
        complete: false,
        lastMessageSent: '3',
        lastDate: yesterday,
      });
      await outreachNoResponseSendNextMessage();
      const messages = await Message.find();
      expect(messages.length).toBe(1);
    });
  });
} else {
  it('is not development', () => {
    expect(1).toBeTruthy();
  });
}
