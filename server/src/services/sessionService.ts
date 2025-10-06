// src/services/sessionService.ts
import { AppDataSource } from "../data-source";
import { Course } from "../models/Course";
import { CourseSession } from "../models/CourseSession";

export async function generateSessionsForCourse(course: Course, weekdays: number[] = [1,3,5]) {
  const repo = AppDataSource.getRepository(CourseSession);
  const sessionsToSave: CourseSession[] = [];
  let d = new Date(course.startDate);
  const end = new Date(course.endDate);
  while (d <= end) {
    const jsDay = d.getDay() === 0 ? 7 : d.getDay(); // 1..7
    if (weekdays.includes(jsDay)) {
      const iso = d.toISOString().slice(0,10);
      const exists = await repo.findOne({ where: { course: { id: course.id }, date: iso }});
      if (!exists) {
        const s = new CourseSession();
        s.course = course;
        s.date = iso;
        s.weekday = jsDay;
        sessionsToSave.push(s);
      }
    }
    d.setDate(d.getDate() + 1);
  }
  if (sessionsToSave.length) {
    await repo.save(sessionsToSave);
  }
  return sessionsToSave;
}
