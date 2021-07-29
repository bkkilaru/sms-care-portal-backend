import mongoose from 'mongoose';

const { Schema } = mongoose;

interface IAppointment extends mongoose.Document {
  _id: string;
  patientID: string;
  appointmentCoachID: string;
  scheduledByCoachID: string;
  cancelledOn?: Date;
  scheduledFor: Date;
  missed?: boolean;
}

const AppointmentSchema = new Schema({
  patientID: { type: mongoose.Schema.Types.ObjectId, required: true },
  appointmentCoachID: { type: mongoose.Schema.Types.ObjectId, required: true },
  scheduledByCoachID: { type: mongoose.Schema.Types.ObjectId, required: true },
  cancelledOn: { type: Date, required: false },
  scheduledFor: { type: Date, required: true },
  missed: { type: Boolean, required: false },
});

const Appointment = mongoose.model<IAppointment>(
  'Appointment',
  AppointmentSchema,
);

export { Appointment, IAppointment };
