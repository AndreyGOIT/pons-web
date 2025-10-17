// server/src/utils/pdf/generateUsersPdf.ts

import PDFDocument from "pdfkit";
import { User } from "../../models/User";

export const generateUsersPdf = (users: User[], res: any) => {
  const doc = new PDFDocument({ margin: 30, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline; filename=users.pdf");

  doc.pipe(res);

  doc.fontSize(18).text("Rekisteröityneet käyttäjät", { align: "center" });
  doc.moveDown(1);

  const tableTop = 80;
  const rowHeight = 20;
  const colWidth = [30, 150, 150, 100, 150]; // ширины колонок: №, Nimi, Email, Puhelin, Kurssi

  // Рисуем заголовки
  const headers = ["№", "Nimi", "Email", "Puhelin", "Kurssi"];
  let x = doc.page.margins.left;
  headers.forEach((h, i) => {
    doc.font("Helvetica-Bold").fontSize(12).text(h, x, tableTop, { width: colWidth[i], align: "left" });
    x += colWidth[i];
  });

  // Рисуем строки
  let y = tableTop + rowHeight;
  users.forEach((u, index) => {
    const coursesStr = u.enrollments?.map(e => e.course.title).join(", ") || "-";

    const row = [
      `${index + 1}`,
      `${u.firstName} ${u.lastName}`,
      u.email,
      u.phoneNumber || "-",
      coursesStr
    ];

    x = doc.page.margins.left;
    row.forEach((text, i) => {
      doc.font("Helvetica").fontSize(10).text(text, x, y, { width: colWidth[i], align: "left" });
      x += colWidth[i];
    });

    y += rowHeight;

    // Добавляем перенос на новую страницу, если y близко к концу
    if (y > doc.page.height - 50) {
      doc.addPage();
      y = 50;
    }
  });

  doc.end();
};

// import PDFDocument from "pdfkit";
// import { User } from "../../models/User";

// export const generateUsersPdf = (users: User[], res: any) => {
//   const doc = new PDFDocument({ margin: 30, size: "A4" });

//   res.setHeader("Content-Type", "application/pdf");
//   res.setHeader("Content-Disposition", "inline; filename=users.pdf");

//   doc.pipe(res);

//   doc.fontSize(18).text("Rekisteröityneet käyttäjät", { align: "center" });
//   doc.moveDown();

//   // Заголовки таблицы
//   doc.fontSize(12).text(
//     "№  | Nimi | Email | Puhelin | Kurssi",
//     { underline: true }
//   );
//   doc.moveDown(0.5);

//   users.forEach((u, index) => {
//     const coursesStr = u.enrollments
//       ?.map((e) => e.course.title)
//       .join(", ") || "-";

//     const line = `${index + 1}. | ${u.firstName} ${u.lastName} | ${u.email} | ${u.phoneNumber || "-"} | ${coursesStr}`;

//     doc.text(line, { lineGap: 4 });
//   });

//   doc.end();
// };