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
        trialBooking.createdAt = new Date();

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

// deleteTrialBookings
export const deleteTrialBookings = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    try {
        const trial = await trialBookingRepo.findOneBy({ id })
        
        if (!trial) {
        res.status(404).json({ message: "Trial not found" });
         return;
        }
        await trialBookingRepo.remove(trial);
        res.json({message: "Trial deleted successfully"})
    } catch (err) {
        console.error("Error deleting trial:", err);
        res.status(500).json({ message: "Error deleting trial", error: err });
    }
}