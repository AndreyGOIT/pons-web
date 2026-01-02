// client/src/api/courses.ts

import api from "./api";

export const getCourses = (active?: boolean) => {
    const params = active !== undefined ? { active } : {};
    return api.get("/courses", { params }).then(res => res.data);
};

export const updateCourse = (id: number, payload: {
    price?: number;
    startDate?: string;
    endDate?: string;
    season?: string;
    isActive?: boolean;
}) => {
    return api.patch(`/courses/${id}`, payload).then(res => res.data);
};