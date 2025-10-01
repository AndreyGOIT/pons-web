// src/initializeData.ts
import { AppDataSource } from "./data-source";
import { User, UserRole } from "./models/User";
import { Course } from "./models/Course";
import { CourseType } from "./enums/CourseType";
import { Enrollment } from "./models/Enrollment";
import bcrypt from "bcrypt";

export const initializeDatabase = async () => {
  try {
    // ❌ НЕ вызываем AppDataSource.initialize() здесь

    // ----удаление админов из базы данных-------
    // const admins = await AppDataSource.getRepository(User).find({
    //   where: { role: UserRole.ADMIN },
    // });

    // await AppDataSource.getRepository(User).remove(admins);
    // console.log(`🗑️ Удалено админов: ${admins.length}`);
    // ----конец кода удаления админов из базы данных-------

    // === Администратор ===
    if (process.env.NODE_ENV !== "production") {
      const adminCount = await AppDataSource.getRepository(User).count({
        where: { role: UserRole.ADMIN },
      });

      if (adminCount === 0) {
        const admin = new User();
        admin.name = "Mika";
        admin.email = "mika@pons.fi";
        admin.password = await bcrypt.hash("mika-admin-2025", 10);
        admin.role = UserRole.ADMIN;

        await AppDataSource.manager.save(admin);
        console.log("✅ Admin created");
      } else {
        console.log("ℹ️ Admin already exists");
      }
    } else {
      console.log(
        "⚠️ Production: creation of default admin is disabled. Use create-admin script or set ADMIN_* env vars."
      );
    }

    // === Курсы ===
    //------очистка данных из базы---------
    // await AppDataSource.query('SET FOREIGN_KEY_CHECKS=0');

    // await AppDataSource.getRepository(Enrollment).clear();
    // await AppDataSource.getRepository(Course).clear();

    // await AppDataSource.query('SET FOREIGN_KEY_CHECKS=1');
    //---конец кода очистки данных из базы------

    const courseCount = await AppDataSource.getRepository(Course).count();
    if (courseCount === 0) {
      const autumnStart = new Date(2025, 8, 1);
      const autumnStartNuoriso = new Date(2025, 8, 2);
      const autumnEnd = new Date(2025, 11, 12);

      const courses = [
        {
          title: CourseType.KN,
          description:
            "Kuntonyrkkeily on tehokas ja hauska tapa kohottaa kuntoa, kehittää koordinaatiota ja purkaa stressiä. Kurssi sopii kaikentasoisille osallistujille – aiempaa kokemusta ei tarvita.",
          price: 135,
          startDate: autumnStart,
          endDate: autumnEnd,
        },
        {
          title: CourseType.NUORISO,
          description:
            "Nuorten nyrkkeilykurssi keskittyy tekniikkaan, kunnon kehittämiseen ja itsevarmuuden kasvattamiseen. Harjoitukset pidetään rennossa ja kannustavassa ilmapiirissä.",
          price: 125,
          startDate: autumnStartNuoriso,
          endDate: autumnEnd,
        },
        {
          title: CourseType.KILPA,
          description:
            "Kilpanyrkkeilyn kurssi on suunnattu kokeneemmille harrastajille, jotka haluavat hioa taitojaan ja valmistautua otteluihin. Treenit sisältävät kovatehoisia harjoituksia ja sparrausta.",
          price: 150,
          startDate: autumnStart,
          endDate: autumnEnd,
        },
      ];

      for (const c of courses) {
        const course = new Course();
        course.title = c.title;
        course.description = c.description;
        course.price = c.price;
        course.startDate = c.startDate;
        course.endDate = c.endDate;

        await AppDataSource.manager.save(course);
      }

      console.log("✅ Courses created");
    } else {
      console.log("ℹ️ Courses already exist");
    }
  } catch (error) {
    console.error("❌ Error during initialization:", error);
  }
};
