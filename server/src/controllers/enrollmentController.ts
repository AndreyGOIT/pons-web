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

export const updateInvoiceStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { invoiceSent, invoicePaid } = req.body;
  
      const enrollment = await enrollmentRepo.findOne({
        where: { id: parseInt(id) },
        relations: ['user', 'course'],
      });
  
      if (!enrollment) {
        return res.status(404).json({ message: 'Enrollment not found' });
      }
  
      // Обновляем поля, только если они переданы
      if (typeof invoiceSent === 'boolean') {
        enrollment.invoiceSent = invoiceSent;
      }
      if (typeof invoicePaid === 'boolean') {
        enrollment.invoicePaid = invoicePaid;
      }
  
      await enrollmentRepo.save(enrollment);
  
      res.json({ message: 'Invoice status updated', enrollment });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err });
    }
  };