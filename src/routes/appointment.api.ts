import express from 'express';
import auth from '../middleware/auth';
import { Appointment } from '../models/appointment.model';
import { CoachMeRequest } from '../types/coach_me_request';
import errorHandler from './error';

const router = express.Router();

router.post('/add', auth, async (req: CoachMeRequest, res) => {
  const { patientID, scheduledFor, appointmentCoachID } = req.body;

  const { userId } = req;

  if (!patientID || patientID === '') {
    return res.status(400).json({
      msg: 'Unable to add appointment: must include patient ID',
    });
  }

  if (!appointmentCoachID || appointmentCoachID === '') {
    return res.status(400).json({
      msg: 'Unable to add appointment: must include appointment coach ID',
    });
  }

  if (
    !scheduledFor ||
    scheduledFor === '' ||
    Number.isNaN(Number(new Date(scheduledFor)))
  ) {
    return res.status(400).json({
      msg: 'Unable to add appointment: must include valid scheduled for date',
    });
  }

  try {
    const newAppointment = new Appointment({
      patientID,
      appointmentCoachID,
      scheduledByCoachID: userId,
      scheduledFor,
    });
    await newAppointment.save();

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    return errorHandler(res, (error as Error).message);
  }
});

export default router;
