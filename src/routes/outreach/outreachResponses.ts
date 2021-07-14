import { ObjectId } from 'mongodb';
import { Message } from '../../models/message.model';
import { Patient, IPatient } from '../../models/patient.model';
import DefaultResponses from './defaultResponses';

type SupportedLanguage = 'english' | 'spanish';

const sendMessageMinutesFromNow = async (
  minutes: number,
  patient: IPatient,
  message: string,
) => {
  const todayPlusMinutes = new Date();
  todayPlusMinutes.setMinutes(todayPlusMinutes.getMinutes() + minutes);
  const newMessage = new Message({
    sent: false,
    phoneNumber: patient.phoneNumber,
    patientID: new ObjectId(patient._id),
    message,
    sender: 'OUTREACH',
    date: todayPlusMinutes,
    isCoachingMessage: true,
  });

  await newMessage.save();
};

const responseLanguage = (language?: string): SupportedLanguage => {
  if (!language) {
    return 'english';
  }
  const cleanLanguage = language.toLowerCase();

  if (cleanLanguage === 'english' || cleanLanguage === 'spanish') {
    return cleanLanguage;
  }

  return 'english';
};

const sendFirstOutreachMessages = async (
  language: string,
  patient: IPatient,
) => {
  let response = [];
  if (language === 'spanish') {
    response = DefaultResponses.zero.spanish(
      patient.coachName,
      patient.firstName,
      patient.clinic,
    );
  } else {
    response = DefaultResponses.zero.english(
      patient.coachName,
      patient.firstName,
      patient.clinic,
    );
  }

  await sendMessageMinutesFromNow(1, patient, response[0]);
  await sendMessageMinutesFromNow(2, patient, response[1]);
  await sendMessageMinutesFromNow(3, patient, response[2]);
  await sendMessageMinutesFromNow(4, patient, response[3]);

  await Patient.findOneAndUpdate(
    { _id: patient._id },
    {
      outreach: {
        outreach: true,
        yes: false,
        complete: false,
        lastMessageSent: '1',
        lastDate: new Date(),
      },
    },
  );
};

const sendSecondOutreachMessages = async (
  language: string,
  patient: IPatient,
) => {
  let response = [];
  if (language === 'spanish') {
    response = DefaultResponses.one.spanish();
  } else {
    response = DefaultResponses.one.english();
  }

  await sendMessageMinutesFromNow(1, patient, response[0]);
  await sendMessageMinutesFromNow(2, patient, response[1]);
  await sendMessageMinutesFromNow(3, patient, response[2]);
  await sendMessageMinutesFromNow(4, patient, response[3]);
  await sendMessageMinutesFromNow(5, patient, response[4]);

  await Patient.findOneAndUpdate(
    { _id: patient._id },
    {
      outreach: {
        outreach: true,
        yes: false,
        complete: false,
        lastMessageSent: '2',
        lastDate: new Date(),
      },
    },
  );
};

const sendThirdOutreachMessages = async (
  language: string,
  patient: IPatient,
) => {
  let response = [];
  if (language === 'spanish') {
    response = DefaultResponses.two.spanish();
  } else {
    response = DefaultResponses.two.english();
  }
  await sendMessageMinutesFromNow(1, patient, response[0]);
  await sendMessageMinutesFromNow(2, patient, response[1]);
  await sendMessageMinutesFromNow(3, patient, response[2]);

  await Patient.findOneAndUpdate(
    { _id: patient._id },
    {
      outreach: {
        outreach: true,
        yes: false,
        complete: false,
        lastMessageSent: '3',
        lastDate: new Date(),
      },
    },
  );
};

const sendYESOutreachMessages = async (language: string, patient: IPatient) => {
  let response = [];
  if (language === 'spanish') {
    response = DefaultResponses.yes.spanish();
  } else {
    response = DefaultResponses.yes.english();
  }

  await sendMessageMinutesFromNow(1, patient, response[0]);

  await Patient.findOneAndUpdate(
    { _id: patient._id },
    {
      outreach: {
        outreach: true,
        yes: true,
        complete: false,
        lastMessageSent: 'yes',
        lastDate: new Date(),
      },
    },
  );
};

const outreachMessage = async (
  patient: IPatient,
  yesMessage: boolean = false,
): Promise<string[]> => {
  const language = responseLanguage(patient.language);
  if (patient.outreach.lastMessageSent === '0' && !yesMessage) {
    await sendFirstOutreachMessages(language, patient);
  } else if (patient.outreach.lastMessageSent === '1' && !yesMessage) {
    await sendSecondOutreachMessages(language, patient);
  } else if (patient.outreach.lastMessageSent === '2' && !yesMessage) {
    await sendThirdOutreachMessages(language, patient);
  } else if (yesMessage || patient.outreach.lastMessageSent === '3') {
    await sendYESOutreachMessages(language, patient);
  }

  return [''];
};

export default outreachMessage;
