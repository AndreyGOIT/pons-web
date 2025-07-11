import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Course } from '../models/Course';

const courseRepo = AppDataSource.getRepository(Course);

export const createCourse = async (req: Request, res: Response) => {
  const { title, description, price } = req.body;
  try {
    const course = courseRepo.create({ title, description, price });
    await courseRepo.save(course);
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: 'Error creating course', error: err });
  }
};

export const getAllCourses = async (_req: Request, res: Response) => {
  try {
    const courses = await courseRepo.find();
    res.json(courses);
  } catch (err) {
    console.error('Error fetching courses:', err);

    res.status(500).json({ message: 'Error fetching courses', error: err });
  }
};