// src/components/admin/CourseRow.tsx
import { useState } from "react";
import { updateCourse } from "../../api/courses";

type Course = {
    id: number;
    title: string;
    season: string;
    price: number;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
};

type Props = {
    course: Course;
    onUpdated: () => void;
};

export const CourseRow = ({ course, onUpdated }: Props) => {
    const [season, setSeason] = useState(course.season);
    const [price, setPrice] = useState(course.price);

    // ⬇️ ВАЖНО: всегда string
    const [startDate, setStartDate] = useState(course.startDate ?? "");
    const [endDate, setEndDate] = useState(course.endDate ?? "");

    const handleSave = async () => {
        await updateCourse(course.id, {
            season,
            price,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
        });
        onUpdated();
    };

    const toggleActive = async () => {
        await updateCourse(course.id, {
            isActive: !course.isActive,
        });
        onUpdated();
    };

    return (
        <tr className={!course.isActive ? "w3-opacity" : undefined}>
            <td>{course.title}</td>

            <td>
                <input
                    className="w3-input w3-border"
                    value={season}
                    onChange={e => setSeason(e.target.value)}
                />
            </td>

            <td>
                <input
                    type="number"
                    className="w3-input w3-border"
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                />
            </td>

            <td>
                <input
                    type="date"
                    className="w3-input w3-border"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                />
            </td>

            <td>
                <input
                    type="date"
                    className="w3-input w3-border"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                />
            </td>

            <td>
                {course.isActive ? (
                    <span className="w3-tag w3-green">Aktiivinen</span>
                ) : (
                    <span className="w3-tag w3-grey">Arkisto</span>
                )}
            </td>

            <td style={{ display: "flex", gap: "6px" }}>
                <button
                    className="w3-button w3-small w3-teal"
                    onClick={handleSave}
                >
                    Tallenna
                </button>

                <button
                    className="w3-button w3-small w3-light-grey"
                    onClick={toggleActive}
                >
                    {course.isActive ? "Arkistoi" : "Aktivoi"}
                </button>
            </td>
        </tr>
    );
};