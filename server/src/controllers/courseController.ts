// src/routes/courseRoutes.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Course } from '../models/Course';

const courseRepo = AppDataSource.getRepository(Course);

export const createCourse = async (req: Request, res: Response) => {
    const {
        title,
        description,
        price,
        startDate,
        endDate,
        season,
    } = req.body;

    if (!title || !season || !price || !startDate || !endDate) {
        return res.status(400).json({
            message: 'Missing required fields: title, season, price, startDate, endDate',
        });
    }

    try {
        // 1️⃣ Проверка: курс с таким title + season уже существует?
        const existing = await courseRepo.findOne({
            where: { title, season },
        });

        if (existing) {
            return res.status(409).json({
                message: `Course "${title}" for season "${season}" already exists`,
            });
        }

        // 2️⃣ (РЕКОМЕНДУЕТСЯ) Деактивируем старые курсы этого типа
        await courseRepo.update(
            { title, isActive: true },
            { isActive: false }
        );

        // 3️⃣ Создаём новый сезон
        const course = courseRepo.create({
            title,
            description,
            price,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            season,
            isActive: true,
        });

        await courseRepo.save(course);

        res.status(201).json(course);
    } catch (err) {
        console.error('Error creating course:', err);
        res.status(500).json({
            message: 'Error creating course',
            error: err,
        });
    }
};

export const getAllCourses = async (req: Request, res: Response) => {
  try {
      const active = typeof req.query.active === 'string'
          ? req.query.active
          : undefined;

      const where =
          active === 'true'
              ? { isActive: true }
              : active === 'false'
                  ? { isActive: false }
                  : {};

      const courses = await courseRepo.find({ where });
      res.json(courses);
  } catch (err) {
    console.error('Error fetching courses:', err);

    res.status(500).json({ message: 'Error fetching courses', error: err });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid course id' });
    }

    const {
        price,
        startDate,
        endDate,
        season,
        isActive,
    } = req.body;

    try {
        const course = await courseRepo.findOne({ where: { id } });

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (price !== undefined) course.price = price;
        if (startDate !== undefined) course.startDate = new Date(startDate);
        if (endDate !== undefined) course.endDate = new Date(endDate);
        if (season !== undefined) course.season = season;
        if (isActive !== undefined) course.isActive = isActive;

        await courseRepo.save(course);

        res.json(course);
    } catch (err) {
        console.error('Error updating course:', err);
        res.status(500).json({ message: 'Error updating course', error: err });
    }
};