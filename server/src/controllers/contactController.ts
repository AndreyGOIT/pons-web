import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { ContactMessage } from "../models/ContactMessage";
import nodemailer from "nodemailer";
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

const repo = AppDataSource.getRepository(ContactMessage);

// Настройка почты (замени на свои SMTP-данные)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const submitMessage = catchAsync(async (req: Request, res: Response) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    throw new AppError('All fields required', 400, 'VALIDATION_ERROR');
  }

  const newMsg = repo.create({ name, email, message });
  await repo.save(newMsg);

  res.status(201).json({
    success: true,
    message: 'Message sent successfully',
  });
});

export const getAllMessages = catchAsync(async (req: Request, res: Response) => {
  const messages = await repo.find({ order: { createdAt: 'DESC' } });

  res.json({
    success: true,
    data: messages,
  });
});

export const replyToMessage = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reply } = req.body;

  const msg = await repo.findOneBy({ id: Number(id) });

  if (!msg) {
    throw new AppError('Message not found', 404, 'MESSAGE_NOT_FOUND');
  }

  msg.adminReply = reply;
  await repo.save(msg);

  try {
    await transporter.sendMail({
      from: `"Pons Admin" <${process.env.SMTP_USER}>`,
      to: msg.email,
      subject: 'Vastaus viestiisi',
      text: reply,
      html: `<p>${reply}</p>`,
    });
  } catch (err) {
    console.error('Ошибка при отправке email:', err);
  }

  res.json({
    success: true,
    message: 'Reply sent and email delivered',
  });
});

export const deleteMessage = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const msg = await repo.findOneBy({ id: Number(id) });

  if (!msg) {
    throw new AppError('Message not found', 404, 'MESSAGE_NOT_FOUND');
  }

  await repo.remove(msg);

  res.json({
    success: true,
    message: 'Message deleted successfully',
  });
});