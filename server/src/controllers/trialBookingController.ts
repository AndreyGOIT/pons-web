// src/controllers/trialBookingController.ts

import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { TrialBooking } from '../models/TrialBooking';

import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

const trialBookingRepo = AppDataSource.getRepository(TrialBooking);

export const createTrialBooking = catchAsync(async (req: Request, res: Response) => {
    const { firstName, lastName, email, phone } = req.body;

    const existingUser = await trialBookingRepo.findOne({ where: { email } });
    if (existingUser) {
        throw new AppError('Email already exists', 409, 'EMAIL_EXISTS');
    }

    const trialBooking = new TrialBooking();
    trialBooking.firstName = firstName;
    trialBooking.lastName = lastName;
    trialBooking.email = email;
    trialBooking.phone = phone;
    trialBooking.createdAt = new Date();

    await trialBookingRepo.save(trialBooking);

    console.log('Trial booking created:', trialBooking);

    res.status(201).json({
        success: true,
        data: trialBooking,
    });
});

export const getTrialBookings = catchAsync(async (req: Request, res: Response) => {
    const trialBookings = await trialBookingRepo.find();

    res.json({
        success: true,
        data: trialBookings,
    });
});

export const deleteTrialBookings = catchAsync(async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        throw new AppError('Invalid trial booking id', 400, 'INVALID_ID');
    }

    const trial = await trialBookingRepo.findOneBy({ id });

    if (!trial) {
        throw new AppError('Trial booking not found', 404, 'TRIAL_NOT_FOUND');
    }

    await trialBookingRepo.remove(trial);

    res.json({
        success: true,
        message: 'Trial booking deleted successfully',
    });
});