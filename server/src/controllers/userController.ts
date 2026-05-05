import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User, UserRole } from '../models/User';
import {MembershipPayment, MembershipStatus} from "../models/MembershipPayment";
import bcrypt from 'bcrypt';
import { validate } from 'class-validator';
import jwt from 'jsonwebtoken';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';


const userRepo = AppDataSource.getRepository(User);
const paymentRepo = AppDataSource.getRepository(MembershipPayment);

//user registration
export const registerUser = catchAsync(async (req: Request, res: Response) => {
  const { firstName, lastName, email, phoneNumber, password } = req.body;

  const existing = await userRepo.findOne({ where: { email } });
  if (existing) {
    throw new AppError('Email already in use', 409, 'EMAIL_EXISTS');
  }

  const user = new User();
  user.firstName = firstName;
  user.lastName = lastName;
  user.name = `${firstName ?? ''} ${lastName ?? ''}`.trim();
  user.email = email;
  user.phoneNumber = phoneNumber;
  user.password = await bcrypt.hash(password, 10);
  user.role = UserRole.CLIENT; // фиксированная роль
  
  // Validate
  const errors = await validate(user);
  if (errors.length > 0) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', errors);
  }

  const savedUser = await userRepo.save(user);

  // ======================================================
  // ✅ Create an initial MembershipPayment record
  // ======================================================

  const payment = new MembershipPayment();
  payment.user = savedUser;
  payment.year = new Date().getFullYear(); // текущий год
  payment.status = MembershipStatus.UNPAID; // дефолтное значение

  await paymentRepo.save(payment);

  console.log(
    `📌 Default membership payment created for ${savedUser.email} (year: ${payment.year})`
  );

  // ✅ Token generation and response
  const token = jwt.sign({ id: savedUser.id, role: savedUser.role }, process.env.JWT_SECRET!, {
    expiresIn: '1h',
  });

  const { password: _, ...userWithoutPassword } = savedUser;

  // ✅ Response with token and user
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    user: userWithoutPassword,
    token,
  });
});
//user login
export const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await userRepo.findOne({ where: { email } });
  console.log('user в логине из репо юзеров:', user);

  if (!user) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  interface JwtPayload {
    id: number;
    role: UserRole;
    iat?: number;
    exp?: number;
  }

  const payload: JwtPayload = { id: user.id, role: user.role };

  const token = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '1h',
  });

  res.json({
    success: true,
    message: 'Login successful',
    user: {
      id: user.id,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
    token,
  });
});

export const getCurrentUser = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401, 'UNAUTHORIZED');
  }

  const userId = Number(req.user.id);
  if (!userId) {
    throw new AppError('Invalid user context', 400, 'INVALID_USER_CONTEXT');
  }

  const user = await AppDataSource.getRepository(User).findOne({
    where: { id: userId },
    select: ['id', 'name', 'firstName', 'lastName', 'email', 'role', 'createdAt', 'updatedAt'],
  });

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  res.json({
    success: true,
    user,
  });
});

export const getUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await userRepo.find();
  const withoutPasswords = users.map(({ password, ...rest }) => rest);

  res.json({
    success: true,
    data: withoutPasswords,
  });
});

export const getUserById = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!id) {
    throw new AppError('Invalid user ID', 400, 'INVALID_ID');
  }

  const user = await userRepo.findOne({ where: { id } });
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const { password, ...userData } = user;

  res.json({
    success: true,
    data: userData,
  });
});

export const updateCurrentUser = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401, 'UNAUTHORIZED');
  }

  const userId = Number(req.user.id);
  if (!userId) {
    throw new AppError('Invalid user context', 400, 'INVALID_USER_CONTEXT');
  }

  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const { firstName, lastName, email, password } = req.body;

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  user.name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  if (email) user.email = email;

  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await userRepo.save(user);

  res.json({
    success: true,
    data: {
      id: updatedUser.id,
      name: updatedUser.name,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
    },
  });
});

export const deleteCurrentUser = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401, 'UNAUTHORIZED');
  }

  const userId = Number(req.user.id);
  if (!userId) {
    throw new AppError('Invalid user context', 400, 'INVALID_USER_CONTEXT');
  }

  const result = await userRepo.delete(userId);

  if (result.affected === 0) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  res.status(204).send();
});

export const deleteUserByAdmin = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!id) {
    throw new AppError('Missing user ID', 400, 'INVALID_ID');
  }

  const user = await userRepo.findOne({ where: { id } });
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  await userRepo.remove(user);

  res.status(204).send();
});