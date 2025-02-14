import express from 'express';
import bodyParser from 'body-parser';
import twilio from 'twilio';
import auth from '../../middleware/auth';
import { Patient, PatientForPhoneNumber } from '../../models/patient.model';
import { parseInboundPatientMessage } from '../../domain/message_parsing';
import { responseForParsedMessage } from '../../domain/glucose_reading_responses';
import { Outcome } from '../../models/outcome.model';
import { Message } from '../../models/message.model';
import errorHandler from '../error';

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));

const { MessagingResponse } = twilio.twiml;
const twiml = new MessagingResponse();

const UNRECOGNIZED_PATIENT_RESPONSE =
  'We do not recognize this number. Please contact CoachMe support.';

export const saveMessage = async ({
  fromPhoneNumber,
  incoming,
  patientID,
  message,
  date,
  sender,
}: {
  fromPhoneNumber: string;
  incoming: boolean;
  patientID: string;
  message: string;
  date: Date;
  sender: string;
}) => {
  const incomingMessage = new Message({
    sent: true,
    phoneNumber: fromPhoneNumber,
    patientID,
    message,
    sender,
    date,
    isCoachingMessage: incoming,
  });

  await incomingMessage.save();
  return incomingMessage;
};

export const createNewOutcome = async ({
  res,
  patientID,
  parsedResponse,
  fromPhoneNumber,
  message,
  date,
}: {
  res: any;
  patientID: string;
  parsedResponse: any;
  fromPhoneNumber: string;
  message: string;
  date: Date;
}) => {
  try {
    if (parsedResponse.glucoseReading) {
      const outcome = new Outcome({
        phoneNumber: fromPhoneNumber,
        patientID,
        response: message,
        value: parsedResponse.glucoseReading.score,
        alertType: parsedResponse.glucoseReading.classification,
        date,
      });

      await outcome.save();
    }
  } catch (e) {
    if (typeof e === 'string') {
      errorHandler(res, e);
    } else if (e instanceof Error) {
      errorHandler(res, e.message);
    }
  }
};

export const manageIncomingMessages = async (
  req: any,
  res: any,
  isCoachingMessage: boolean,
) => {
  const inboundMessage = req.body.Body || 'Invalid Text (image)';
  const fromPhoneNumber = req.body.From.slice(2);
  const date = new Date();
  const patient = await PatientForPhoneNumber(fromPhoneNumber);
  if (!patient) {
    const twilioResponse = twiml.message(UNRECOGNIZED_PATIENT_RESPONSE);
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twilioResponse.toString());
    return;
  }

  const incomingMessage = await saveMessage({
    fromPhoneNumber,
    incoming: isCoachingMessage,
    patientID: patient?._id,
    message: inboundMessage,
    date,
    sender: 'PATIENT',
  });

  if (isCoachingMessage) {
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(incomingMessage?.sent.toString());
    return;
  }

  const parsedResponse = parseInboundPatientMessage(inboundMessage);
  await createNewOutcome({
    res,
    patientID: patient?._id,
    parsedResponse,
    fromPhoneNumber,
    message: inboundMessage,
    date,
  });

  const responseMessage = await responseForParsedMessage(
    parsedResponse,
    patient?.language,
  );

  await saveMessage({
    fromPhoneNumber,
    incoming: isCoachingMessage,
    patientID: patient?._id,
    message: responseMessage,
    date,
    sender: 'BOT',
  });
  res.writeHead(204, { 'Content-Type': 'text/xml' });
  res.end();
};

router.post('/sendMessage', auth, async (req, res) => {
  const patient = await Patient.findById(req.body.patientID);
  const date = new Date();
  const content = req.body.message;
  if (!patient) {
    res.status(404).send({
      msg: 'Patient not found',
    });
    return;
  }

  const outgoingMessage = new Message({
    sent: false,
    phoneNumber: patient?.phoneNumber,
    patientID: patient?._id,
    message: content,
    sender: 'COACH',
    date,
    isCoachingMessage: true,
  });

  await outgoingMessage.save();
  res.status(200).send({
    success: true,
    msg: outgoingMessage,
  });
});

router.post('/reply', async (req, res) =>
  manageIncomingMessages(req, res, false),
);

router.post('/receive', async (req, res) =>
  manageIncomingMessages(req, res, true),
);

export default router;
