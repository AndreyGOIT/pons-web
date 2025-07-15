import PDFDocument from 'pdfkit';
import { Course } from '../../models/Course';
import { Response } from 'express';
import { format } from 'date-fns';

export const generateCoursesPdf = (courses: Course[], res: Response) => {
  const doc = new PDFDocument();
  
  // Устанавливаем заголовки
  res.setHeader('Content-Disposition', 'attachment; filename="courses-report.pdf"');
  res.setHeader('Content-Type', 'application/pdf');

  doc.pipe(res);

  doc.fontSize(20).text('Отчёт по курсам', { align: 'center' });
  doc.moveDown();

  courses.forEach((course, index) => {
    doc
      .fontSize(14)
      .text(`${index + 1}. Название: ${course.title}`)
      .text(`   Описание: ${course.description}`)
      .text(`   Дата начала: ${format(new Date(course.startDate), 'dd.MM.yyyy')}`)
      .moveDown();
  });

  doc.end(); // Завершаем поток
};