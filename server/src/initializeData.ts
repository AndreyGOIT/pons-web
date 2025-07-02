// src/initializeData.ts
import { AppDataSource } from './data-source';
import { User, UserRole } from './models/User';
import { Course } from './models/Course';
import { CourseType } from './enums/CourseType';
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
    const courseCount = await AppDataSource.getRepository(Course).count();
    if (courseCount === 0) {
      const courses = [
        {
          title: CourseType.KN,
          description: 'Kurssi KN aloittelijoille',
          price: 50.0,
        },
        {
          title: CourseType.NUORISO,
          description: 'Nuorille suunnattu kurssi',
          price: 40.0,
        },
        {
          title: CourseType.KILPA,
          description: 'Kilpatasolle suunnattu treeni',
          price: 60.0,
        },
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