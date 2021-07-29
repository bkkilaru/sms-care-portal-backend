import { ObjectId } from 'mongodb';
import { Appointment } from './appointment.model';

describe('Appointment', () => {
  it('should be invalid if Appointment is empty', (done) => {
    const appointment = new Appointment();
    appointment.validate((err) => {
      expect(err).toBeTruthy();
      done();
    });
  });
  it('Breaks if we pass an invalid date', (done) => {
    const appointment = new Appointment({
      patientID: new ObjectId(0),
      appointmentCoachID: new ObjectId(1),
      scheduledByCoachID: new ObjectId(1),
      scheduledFor: '21',
    });
    appointment.validate((err) => {
      expect(err).toBeTruthy();
      done();
    });
  });
  it('Appointment is valid if we pass a valid date', (done) => {
    const appointment = new Appointment({
      patientID: new ObjectId(0),
      appointmentCoachID: new ObjectId(1),
      scheduledByCoachID: new ObjectId(1),
      scheduledFor: '2021/01/01',
    });
    appointment.validate((err) => {
      expect(err).toBeFalsy();
      done();
    });
  });
  it('Appointment is valid if we pass a valid date. missed and cancelledOn are optional', (done) => {
    const appointment = new Appointment({
      patientID: new ObjectId(0),
      appointmentCoachID: new ObjectId(1),
      scheduledByCoachID: new ObjectId(1),
      scheduledFor: '2021/01/01',
    });
    appointment.validate((err) => {
      expect(err).toBeFalsy();
      done();
    });
  });
  it('Appointment is valid if we pass missed and deletedOn', (done) => {
    const appointment = new Appointment({
      patientID: new ObjectId(0),
      appointmentCoachID: new ObjectId(1),
      scheduledByCoachID: new ObjectId(1),
      scheduledFor: '2021/01/01',
      cancelledOn: '2021/01/03',
      missed: true,
    });
    appointment.validate((err) => {
      expect(err).toBeFalsy();
      done();
    });
  });

});
