import express from 'express';
import auth from '../middleware/auth';
import { Coach } from '../models/coach.model';
import { Patient } from '../models/patient.model';
import { Appointment } from '../models/appointment.model';
import { CoachMeRequest } from '../types/coach_me_request';
import errorHandler from './error';

const router = express.Router();

router.get('/getPatients', auth, (req, res) => {
  return Patient.find().then((patients) => {
    return res.status(200).json(patients);
  });
});

router.get('/appointments', auth, async (req: CoachMeRequest, res) => {
  const { userId } = req;
  const now = new Date();
  now.setMinutes(now.getMinutes() + 20);
  const appointments = await Appointment.find({
    appointmentCoachID: userId,
    scheduledFor: {
      $gte: now,
    },
  }).sort({
    scheduledFor: 1,
  });

  if (appointments) {
    return res.status(200).json(appointments);
  }

  return errorHandler(res, 'Unable to get coach appointments');
});

router.get('/search', auth, async (req, res) => {
  const { query } = req.query;
  Coach.aggregate([
    { $project: { name: { $concat: ['$firstName', ' ', '$lastName'] } } },
    {
      $match: {
        name: {
          $regex: query,
          $options: 'i',
        },
      },
    },
  ]).exec((err, result) => {
    return res.status(200).json({
      coaches: result,
    });
  });
});

export default router;
