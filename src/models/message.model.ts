import mongoose from 'mongoose';

const { Schema } = mongoose;

interface IMessage extends mongoose.Document {
  _id: string;
  phoneNumber: string;
  patientID: number;
  sender: 'COACH' | 'BOT' | 'OUTREACH';
  message: string;
  image: {
    data: Buffer;
    contentType: String;
  };
  date: Date;
  sent: boolean;
  isCoachingMessage: boolean;
  publicImagesURLs?: string[];
}

const MessageSchema = new Schema({
  patientID: { type: mongoose.Schema.Types.ObjectId, required: true },
  phoneNumber: { type: String, required: true },
  message: { type: String, required: true },
  sender: { type: String, required: true },
  image: {
    data: { type: mongoose.Schema.Types.Buffer, required: false },
    contentType: { type: String, required: false },
  },
  date: { type: mongoose.Schema.Types.Date, required: true },
  sent: { type: mongoose.Schema.Types.Boolean, default: false },
  isCoachingMessage: { type: Boolean, required: true, default: false },
  publicImagesURLs: { type: Array, required: false },
});

const Message = mongoose.model<IMessage>('Message', MessageSchema);

export { Message, IMessage };
