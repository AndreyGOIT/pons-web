// server/src/utils/pdf/generateUsersPdf.ts
import PDFDocument from "pdfkit";
import { User } from "../../models/User";

export const generateUsersPdf = (users: User[], res: any) => {
  const doc = new PDFDocument({ margin: 30, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline; filename=users.pdf");

  doc.pipe(res);

  doc.fontSize(18).text("Rekisteröityneet käyttäjät", { align: "center" });
  doc.moveDown();

  users.forEach((u, i) => {
    doc
      .fontSize(12)
      .text(`${i + 1}. ${u.name} (${u.email}) - Rooli: ${u.role}`, {
        lineGap: 4,
      });
  });

  doc.end();
};