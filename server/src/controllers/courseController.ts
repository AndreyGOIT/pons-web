// src/routes/courseRoutes.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Course } from '../models/Course';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

const courseRepo = AppDataSource.getRepository(Course);

export const createCourse = catchAsync(async (req: Request, res: Response) => {
    const {
        title,
        description,
        price,
        startDate,
        endDate,
        season,
    } = req.body;

    if (!title || !season || !price || !startDate || !endDate) {
        throw new AppError(
            'Missing required fields: title, season, price, startDate, endDate',
            400,
            'VALIDATION_ERROR'
        );
    }

    const existing = await courseRepo.findOne({
        where: { title, season },
    });

    if (existing) {
        throw new AppError(
            `Course "${title}" for season "${season}" already exists`,
            409,
            'COURSE_EXISTS'
        );
    }

    await courseRepo.update(
        { title, isActive: true },
        { isActive: false }
    );

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

    res.status(201).json({
        success: true,
        data: course,
    });
});

export const getAllCourses = catchAsync(async (req: Request, res: Response) => {
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

  res.json({
    success: true,
    data: courses,
  });
});

export const updateCourse = catchAsync(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        throw new AppError('Invalid course id', 400, 'INVALID_ID');
    }

    const {
        price,
        startDate,
        endDate,
        season,
        isActive,
    } = req.body;

    const course = await courseRepo.findOne({ where: { id } });

    if (!course) {
        throw new AppError('Course not found', 404, 'COURSE_NOT_FOUND');
    }

    if (price !== undefined) course.price = price;
    if (startDate !== undefined) course.startDate = new Date(startDate);
    if (endDate !== undefined) course.endDate = new Date(endDate);
    if (season !== undefined) course.season = season;
    if (isActive !== undefined) course.isActive = isActive;

    await courseRepo.save(course);

    res.json({
        success: true,
        data: course,
    });
});