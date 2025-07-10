// src/initializeData.ts
import { AppDataSource } from './data-source';
import { User, UserRole } from './models/User';
import { Course } from './models/Course';
import { CourseType } from './enums/CourseType';
import { Enrollment } from './models/Enrollment';
import bcrypt from 'bcryptjs';

export const initializeDatabase = async () => {
  try {
    // ❌ НЕ вызываем AppDataSource.initialize() здесь

    // === Администратор ===
    const adminCount = await AppDataSource.getRepository(User).count({
      where: { role: UserRole.ADMIN },
    });

    if (adminCount === 0) {
      const admin = new User();
      admin.name = 'Admin';
      admin.email = 'admin@fitnessapp.fi';
      admin.password = await bcrypt.hash('admin123', 10);
      admin.role = UserRole.ADMIN;

      await AppDataSource.manager.save(admin);
      console.log('✅ Admin created');
    } else {
      console.log('ℹ️ Admin already exists');
    }

    // === Курсы ===
    //------очистка данных из базы---------
    //     // await AppDataSource.query('PRAGMA foreign_keys = OFF');

    // await AppDataSource.getRepository(Enrollment).clear();
    // await AppDataSource.getRepository(Course).clear();

    // await AppDataSource.query('PRAGMA foreign_keys = ON');

    const courseCount = await AppDataSource.getRepository(Course).count();
    if (courseCount === 0) {
      const courses = [
        {
          title: CourseType.KN,
          description: 'Kuntonyrkkeily on tehokas ja hauska tapa kohottaa kuntoa, kehittää koordinaatiota ja purkaa stressiä. Kurssi sopii kaikentasoisille osallistujille – aiempaa kokemusta ei tarvita.',
          price: 175,
        },
        {
          title: CourseType.NUORISO,
          description: 'Nuorten nyrkkeilykurssi keskittyy tekniikkaan, kunnon kehittämiseen ja itsevarmuuden kasvattamiseen. Harjoitukset pidetään rennossa ja kannustavassa ilmapiirissä.',
          price: 140,
        },
        {
          title: CourseType.KILPA,
          description: 'Kilpanyrkkeilyn kurssi on suunnattu kokeneemmille harrastajille, jotka haluavat hioa taitojaan ja valmistautua otteluihin. Treenit sisältävät kovatehoisia harjoituksia ja sparrausta.',
          price: 200,
        }
      ];

      for (const c of courses) {
        const course = new Course();
        course.title = c.title;
        course.description = c.description;
        course.price = c.price;

        await AppDataSource.manager.save(course);
      }

      console.log('✅ Courses created');
    } else {
      console.log('ℹ️ Courses already exist');
    }
  } catch (error) {
    console.error('❌ Error during initialization:', error);
  }
};