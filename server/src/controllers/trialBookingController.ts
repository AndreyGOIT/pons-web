// src/controllers/trialBookingController.ts

import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { TrialBooking } from '../models/TrialBooking';

const trialBookingRepo = AppDataSource.getRepository(TrialBooking);

// createTrialBooking
export const createTrialBooking = async (req: Request, res: Response): Promise<void> => {
    try {
        const { firstName, lastName, email, phone } = req.body;

        // Проверка на существование email в базе данных
        const existingUser = await trialBookingRepo.findOne({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'Email already exists' });
            return;
        }

        // Создание новой записи в таблице TrialBooking
        const trialBooking = new TrialBooking();
        trialBooking.firstName = firstName;
        trialBooking.lastName = lastName;
        trialBooking.email = email;
        trialBooking.phone = phone;

        await trialBookingRepo.save(trialBooking);
        console.log('Trial booking created:', trialBooking);
        res.status(201).json(trialBooking);
    } 
    catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};

// getTrialBookings
export const getTrialBookings = async (req: Request, res: Response): Promise<void> => {
    try {
        const trialBookings = await trialBookingRepo.find();
        res.json(trialBookings);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};