import { ObjectId } from 'mongodb';
import { Message } from '../../models/message.model';
import { Patient, IPatient } from '../../models/patient.model';
import DefaultResponses from './defaultResponses';

type SupportedLanguage = 'english' | 'spanish';

const sendMessageMinutesFromNow = async ({
  minutes,
  patient,
  message,
  mediaURLs,
}: {
  minutes: number;
  patient: IPatient;
  message: string;
  mediaURLs?: string[];
}) => {
  const todayPlusMinutes = new Date();
  todayPlusMinutes.setMinutes(todayPlusMinutes.getMinutes() + minutes);

  if (mediaURLs) {
    const newMessage = new Message({
      sent: false,
      phoneNumber: patient.phoneNumber,
      patientID: new ObjectId(patient._id),
      message,
      image: {
        publicURLs: mediaURLs,
      },
      sender: 'OUTREACH',
      date: todayPlusMinutes,
      isCoachingMessage: true,
    });
    await newMessage.save();
    return;
  }

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

export const getResponses = (
  language: string,
  messageIdentifier: string,
  patient: IPatient,
) => {
  let response = [];
  switch (messageIdentifier) {
    case 'first':
      if (language === 'spanish') {
        response = DefaultResponses.first.spanish(
          patient.coachName,
          patient.firstName,
          patient.clinic,
        );
      } else {
        response = DefaultResponses.first.english(
          patient.coachName,
          patient.firstName,
          patient.clinic,
        );
      }
      break;
    case 'second':
      if (language === 'spanish') {
        response = DefaultResponses.second.spanish();
      } else {
        response = DefaultResponses.second.english();
      }
      break;
    case 'third':
      if (language === 'spanish') {
        response = DefaultResponses.third.spanish();
      } else {
        response = DefaultResponses.third.english();
      }
      break;
    case 'yes':
      if (language === 'spanish') {
        response = DefaultResponses.yes.spanish();
      } else {
        response = DefaultResponses.yes.english();
      }
      break;
    default:
      return [''];
  }
  return response;
};

const sendFirstOutreachMessages = async (
  language: string,
  patient: IPatient,
) => {
  const response = getResponses(language, 'first', patient);

  await sendMessageMinutesFromNow({
    minutes: 1,
    patient,
    message: response[0],
  });
  await sendMessageMinutesFromNow({
    minutes: 2,
    patient,
    message: response[1],
  });
  await sendMessageMinutesFromNow({
    minutes: 3,
    patient,
    message: response[2],
  });
  await sendMessageMinutesFromNow({
    minutes: 4,
    patient,
    message: response[3],
  });

  await Patient.findOneAndUpdate(
    { _id: patient._id },
    {
      outreach: {
        enabled: true,
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
  const response = getResponses(language, 'second', patient);

  await sendMessageMinutesFromNow({
    minutes: 1,
    patient,
    message: response[0],
    mediaURLs: [response[1], response[2]],
  });

  await sendMessageMinutesFromNow({
    minutes: 4,
    patient,
    message: response[3],
  });

  await sendMessageMinutesFromNow({
    minutes: 5,
    patient,
    message: response[4],
  });

  await Patient.findOneAndUpdate(
    { _id: patient._id },
    {
      outreach: {
        enabled: true,
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
  const response = getResponses(language, 'third', patient);

  await sendMessageMinutesFromNow({
    minutes: 1,
    patient,
    message: response[0],
  });
  await sendMessageMinutesFromNow({
    minutes: 2,
    patient,
    message: response[1],
  });
  await sendMessageMinutesFromNow({
    minutes: 3,
    patient,
    message: response[2],
  });

  await Patient.findOneAndUpdate(
    { _id: patient._id },
    {
      outreach: {
        enabled: true,
        yes: false,
        complete: false,
        lastMessageSent: '3',
        lastDate: new Date(),
      },
    },
  );
};

const sendYESOutreachMessages = async (language: string, patient: IPatient) => {
  const response = getResponses(language, 'yes', patient);

  await sendMessageMinutesFromNow({
    minutes: 1,
    patient,
    message: response[0],
  });

  await Patient.findOneAndUpdate(
    { _id: patient._id },
    {
      outreach: {
        enabled: true,
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
