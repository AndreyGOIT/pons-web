import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Enrollment } from '../models/Enrollment';
import { User } from '../models/User';
import { Course } from '../models/Course';

const enrollmentRepo = AppDataSource.getRepository(Enrollment);
const userRepo = AppDataSource.getRepository(User);
const courseRepo = AppDataSource.getRepository(Course);

export const enrollUser = async (req: Request, res: Response) => {
  const { userId, courseId } = req.body;

  try {
    const user = await userRepo.findOneBy({ id: userId });
    const course = await courseRepo.findOneBy({ id: courseId });

    if (!user || !course) {
      return res.status(404).json({ message: 'User or course not found' });
    }

    const enrollment = enrollmentRepo.create({ user, course });
    await enrollmentRepo.save(enrollment);

    res.status(201).json(enrollment);
  } catch (err) {
    res.status(500).json({ message: 'Error enrolling user', error: err });
  }
};

export const markAsPaid = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    const enrollment = await enrollmentRepo.findOneBy({ id });
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    enrollment.invoicePaid = true;
    await enrollmentRepo.save(enrollment);

    res.json({ message: 'Marked as paid', enrollment });
  } catch (err) {
    res.status(500).json({ message: 'Error updating payment status', error: err });
  }
};