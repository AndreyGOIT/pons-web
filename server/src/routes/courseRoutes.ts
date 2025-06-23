import { Router } from 'express';
import { createCourse, getAllCourses } from '../controllers/courseController';

const router = Router();

router.post('/', createCourse);
router.get('/', getAllCourses);

export default router;