// server/src/controllers/userController.ts

import { Request, Response } from 'express';

export const getAllUsers = (req: Request, res: Response) => {
  res.send('All users');
};

export const getUserById = (req: Request, res: Response) => {
  const { id } = req.params;
  res.send(`User with ID: ${id}`);
};