import { ObjectId } from 'mongodb';
import { Message } from '../../models/message.model';
import { Patient, IPatient } from '../../models/patient.model';
import outreachMessageTextsBuilder from './outreachMessageTextsBuilder';
import cleanResponseLanguage from '../../utils/cleanResponseLanguage';

const createMessagesFromArray = async (
  messageArray: string[],
  patient: IPatient,
) => {
  let mediaURLs = [];
  // eslint-disable-next-line no-restricted-syntax
  for await (const message of messageArray) {
    if (message.includes('https://')) {
      mediaURLs.push(message);
    } else {
      const newMessage = new Message({
        sent: false,
        phoneNumber: patient.phoneNumber,
        patientID: new ObjectId(patient._id),
        message,
        sender: 'OUTREACH',
        date: new Date(),
        isCoachingMessage: true,
        publicImagesURLs: mediaURLs,
      });
      await newMessage.save();
      mediaURLs = [];
    }
  }
};

const getNextTemplateToSend = (lastTemplateSent: string) => {
  switch (lastTemplateSent) {
    case 'zero':
      return 'first';
    case 'first':
      return 'second';
    case 'second':
      return 'patientRequestedContact';
    default:
      return 'patientContactMessageSent';
  }
};

const sendOutreachMessages = async ({
  patient,
  receivedYESMessage,
}: {
  patient: IPatient;
  receivedYESMessage?: boolean;
}) => {
  const outreachStage = receivedYESMessage
    ? 'patientRequestedContact'
    : patient.outreach.lastTemplateSent;

  const response = outreachMessageTextsBuilder({
    coachName: patient?.coachName,
    patientName: `${patient?.firstName} ${patient?.lastName}`,
    clinicName: patient?.clinic,
    outreachStage,
    isSpanishMessage: cleanResponseLanguage(patient.language) === 'spanish',
  });

  await createMessagesFromArray(response, patient);

  const lastTemplateSent = getNextTemplateToSend(outreachStage);

  await Patient.findOneAndUpdate(
    { _id: patient._id },
    {
      outreach: {
        enabled: patient.enabled,
        patientRequestedContact: outreachStage === 'patientRequestedContact',
        complete: patient.outreach.complete,
        lastTemplateSent,
        lastTemplateSentOn: new Date(),
      },
    },
  );
};

export default sendOutreachMessages;
