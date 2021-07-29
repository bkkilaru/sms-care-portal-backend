import express from 'express';
import auth from '../middleware/auth';
import { Appointment } from '../models/appointment.model';
import { CoachMeRequest } from '../types/coach_me_request';
import errorHandler from './error';

const router = express.Router();

router.post('/', auth, async (req: CoachMeRequest, res) => {
  const { patientID, scheduledFor, appointmentCoachID } = req.body;

  const { userId } = req;

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
