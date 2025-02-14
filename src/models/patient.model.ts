import mongoose from 'mongoose';

const { Schema } = mongoose;

interface IPatient extends mongoose.Document {
  _id: string;
  firstName: string;
  lastName: string;
  coachID: string;
  coachName: string;
  language: string;
  phoneNumber: string;
  prefTime: number;
  messagesSent: number;
  responseCount: number;
  reports: [
    {
      data: Buffer;
      contentType: String;
    },
  ];
  enabled: boolean;
  clinic: string;
  outreach: {
    enabled: boolean;
    patientRequestedContact: boolean;
    complete: boolean;
    lastTemplateSent:
    | 'zero'
    | 'first'
    | 'second'
    | 'patientRequestedContact'
    | 'patientContactMessageSent';
    lastTemplateSentOn: Date;
  };
}

const PatientSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  coachID: { type: mongoose.Schema.Types.ObjectId },
  coachName: { type: String, required: true },
  language: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  prefTime: { type: Number, required: true },
  messagesSent: { type: Number, required: true },
  responseCount: { type: Number, required: true },
  reports: [
    {
      data: { type: Buffer, required: true },
      contentType: { type: String, required: true },
    },
  ],
  enabled: { type: Boolean, required: true },
  clinic: { type: String, required: true, default: 'CoachMe' },
  outreach: {
    enabled: { type: Boolean, required: true, default: false },
    patientRequestedContact: { type: Boolean, required: true, default: false },
    complete: { type: Boolean, required: true, default: false },
    lastTemplateSent: { type: String, required: true, default: 'zero' },
    lastTemplateSentOn: { type: Date, required: true, default: new Date() },
  },
});

const Patient = mongoose.model<IPatient>('Patient', PatientSchema);

const PatientForPhoneNumber = async (
  phoneNumber: string,
): Promise<IPatient | null> => {
  return Patient.findOne({ phoneNumber });
};

export { Patient, PatientForPhoneNumber, IPatient };
