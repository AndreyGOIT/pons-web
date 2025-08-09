import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { ContactMessage } from "../models/ContactMessage";
import nodemailer from "nodemailer";

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

export const submitMessage = async (req: Request, res: Response) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields required" });
  }

  const newMsg = repo.create({ name, email, message });
  await repo.save(newMsg);

  res.status(201).json({ message: "Message sent successfully" });
};

export const getAllMessages = async (req: Request, res: Response) => {
  const messages = await repo.find({ order: { createdAt: "DESC" } });
  res.json(messages);
};

export const replyToMessage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reply } = req.body;

  const msg = await repo.findOneBy({ id: Number(id) });
  if (!msg) return res.status(404).json({ message: "Message not found" });

  msg.adminReply = reply;
  await repo.save(msg);

  // Отправка email пользователю
  try {
    await transporter.sendMail({
      from: `"Pons Admin" <${process.env.SMTP_USER}>`,
      to: msg.email,
      subject: "Vastaus viestiisi",
      text: reply,
      html: `<p>${reply}</p>`,
    });
  } catch (err) {
    console.error("Ошибка при отправке email:", err);
  }

  res.json({ message: "Reply sent and email delivered" });
};

export const deleteMessage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const msg = await repo.findOneBy({ id: Number(id) });
  if (!msg) return res.status(404).json({ message: "Message not found" });

  await repo.remove(msg);
  res.json({ message: "Message deleted successfully" });
};