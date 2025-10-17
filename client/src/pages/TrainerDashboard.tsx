// client/src/pages/TrainerDashboard.jsx
import React, { useEffect, useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

// TypeScript interfaces
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
}

interface Enrollment {
  id: number;
  user: User;
  [key: string]: any;
}

interface Session {
  id: number;
  date: string;
  [key: string]: any;
}

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  startDate: string;
  endDate: string;
  enrollments?: Enrollment[];
}

interface AttendanceData {
  [userId: number]: {
    [sessionId: number]: boolean;
  };
}

interface Attendance {
  id: number;
  present: boolean;
  session: Session;
  enrollment: Enrollment;
}

interface CourseAttendanceResponse {
  course: Course & { enrollments: Enrollment[] };
  sessions: Session[];
  attendances: Attendance[];
}

const TrainerDashboard: React.FC = () => {
  const [trainer, setTrainer] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({});
  const [filterDates, setFilterDates] = useState({ start: "", end: "" });
  const [notification, setNotification] = useState<string | null>(null);

  const navigate = useNavigate();

  // Показ уведомлений
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Получаем профиль тренера
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchTrainerData = async () => {
      try {
        const { data } = await api.get("/trainer/profile");
        setTrainer(data);
        fetchCourses();
      } catch (err) {
        console.error("Error fetching trainer profile:", err);
        navigate("/login");
      }
    };

    const fetchCourses = async () => {
      try {
        const { data } = await api.get<Course[]>("/trainer/courses");
        setCourses(data);
      } catch (err) {
        console.error("Ошибка при загрузке курсов:", err);
      }
    };

    fetchTrainerData();
  }, [navigate]);

  // Выбор курса и загрузка посещаемости
  const handleCourseSelect = async (courseId: string) => {
    if (!courseId) {
      setSelectedCourse(null);
      setSessions([]);
      setEnrollments([]);
      setAttendanceData({});
      return;
    }

    const id = Number(courseId);
    setSelectedCourse(id);

    try {
      const { data } = await api.get<CourseAttendanceResponse>(
        `/trainer/courses/${id}/attendances`
      );

      setSessions(data.sessions);
      setEnrollments(data.course.enrollments);

      // Формируем объект посещаемости
      const initialData: AttendanceData = {};
      data.course.enrollments.forEach((enroll) => {
        initialData[enroll.user.id] = {};
        data.attendances.forEach((att) => {
          if (att.enrollment.id === enroll.id) {
            initialData[enroll.user.id][att.session.id] = att.present;
          }
        });
      });
      setAttendanceData(initialData);

      setFilterDates({
        start: data.course.startDate,
        end: data.course.endDate,
      });

      showNotification("Kurssin tiedot ladattu onnistuneesti ✅");
    } catch (error) {
      console.error("Ошибка при загрузке посещаемости:", error);
      showNotification("Virhe ladattaessa kurssin tietoja ❌");
    }
  };

  // Переключение посещаемости
  const handleToggleAttendance = async (userId: number, sessionId: number) => {
    const newValue = !attendanceData[userId]?.[sessionId];
    setAttendanceData((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [sessionId]: newValue },
    }));

    try {
      await api.post(
        `/trainer/courses/${selectedCourse}/attendances/${sessionId}/toggle`,
        { userId, present: newValue }
      );
      showNotification("Tallennettu onnistuneesti ✅");
    } catch (err) {
      console.error("Ошибка при обновлении посещаемости:", err);
      showNotification("Virhe tallennettaessa läsnäoloa ❌");
    }
  };

  // Экспорт в PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Attendance Report for Course`, 10, 10);
    let y = 20;
    enrollments.forEach((e) => {
      let row = `${e.user.firstName} ${e.user.lastName}`;
      sessions.forEach((s) => {
        if (
          new Date(s.date) >= new Date(filterDates.start) &&
          new Date(s.date) <= new Date(filterDates.end)
        ) {
          row += ` | ${attendanceData[e.user.id]?.[s.id] ? "✔️" : "❌"}`;
        }
      });
      doc.text(row, 10, y);
      y += 10;
    });
    doc.save(`attendance_${selectedCourse}.pdf`);
  };

  // Экспорт в Excel
  const exportExcel = () => {
    const data = enrollments.map((e) => {
      const row: { [key: string]: string } = {
        User: `${e.user.firstName} ${e.user.lastName}`,
      };
      sessions.forEach((s) => {
        if (
          new Date(s.date) >= new Date(filterDates.start) &&
          new Date(s.date) <= new Date(filterDates.end)
        ) {
          row[new Date(s.date).toLocaleDateString()] = attendanceData[
            e.user.id
          ]?.[s.id]
            ? "Present"
            : "Absent";
        }
      });
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `attendance_${selectedCourse}.xlsx`);
  };

  return (
    <div className="w3-container w3-margin-top w3-margin-bottom">
      {/* Уведомления */}
      {notification && (
        <div
          className="w3-panel w3-round w3-animate-opacity w3-center"
          style={{
            backgroundColor: notification.includes("✅")
              ? "#d9fdd3"
              : "#ffe0e0",
            color: notification.includes("✅") ? "#155724" : "#721c24",
            transition: "opacity 0.5s ease",
          }}
        >
          {notification}
        </div>
      )}

      {/* Профиль тренера */}
      <div
        className="w3-card w3-white w3-padding w3-round-large w3-margin-bottom"
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2 className="w3-center">Hallintapaneeli</h2>
        <p className="w3-center w3-text-grey w3-large">
          <strong>
            {trainer?.firstName} {trainer?.lastName}
          </strong>
        </p>
        <p className="w3-center">
          <span className="w3-text-dark-gray">{trainer?.email}</span> |{" "}
          <span className="w3-tag w3-teal w3-round">Valmentaja</span>
        </p>
        <p className="w3-center w3-small w3-text-gray">
          Aktiivisia kursseja: <b>{courses.length}</b>
        </p>
      </div>

      {/* Выбор курса */}
      <div
        className="w3-card w3-light-grey w3-round w3-padding w3-margin-bottom"
        style={{ maxWidth: "700px", margin: "0 auto" }}
      >
        <label className="w3-text-dark-grey">
          <b>Valitse kurssi:</b>
        </label>
        <select
          className="w3-select w3-border"
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            handleCourseSelect(e.target.value)
          }
        >
          <option value="">--Valitse kurssi--</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      <h4 className="w3-center w3-text-teal w3-margin-top">
        Kurssin osallistujien läsnäolot
      </h4>
      {/* Таблица посещаемости */}
      {selectedCourse && (
        <div
          className="w3-card w3-round-large w3-padding w3-animate-opacity"
          style={{
            maxWidth: "95%",
            margin: "20px auto",
            backgroundColor: "#fefefe",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              className="w3-table-all w3-hoverable w3-margin-top w3-centered"
              style={{
                borderSpacing: "0 6px",
                minWidth: "900px",
                borderCollapse: "separate",
              }}
            >
              <thead style={{ backgroundColor: "#009688", color: "#fff" }}>
                <tr>
                  <th
                    style={{
                      position: "sticky",
                      left: 0,
                      backgroundColor: "#009688",
                      color: "#fff",
                      zIndex: 2,
                    }}
                  >
                    Käyttäjä
                  </th>
                  {sessions.map((s) => {
                    const date = new Date(s.date);
                    const day = String(date.getDate()).padStart(2, "0");
                    const month = String(date.getMonth() + 1).padStart(2, "0"); // месяцы от 0 до 11
                    return (
                      <th
                        key={s.id}
                        className="w3-border-left"
                        style={{
                          position: "sticky",
                          top: 0,
                          backgroundColor: "#009688",
                          color: "#fff",
                          zIndex: 1,
                        }}
                      >
                        {`${day}/${month}`}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => (
                  <tr key={e.user.id}>
                    <td
                      style={{
                        position: "sticky",
                        left: 0,
                        backgroundColor: "#fff",
                        zIndex: 1,
                        fontWeight: "500",
                      }}
                    >
                      {e.user.firstName} {e.user.lastName}
                    </td>
                    {sessions.map((s) => (
                      <td key={s.id} className="w3-center w3-border-left">
                        <input
                          type="checkbox"
                          className="w3-check"
                          checked={attendanceData[e.user.id]?.[s.id] || false}
                          onChange={() =>
                            handleToggleAttendance(e.user.id, s.id)
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="w3-margin-top w3-center">
            <button
              className="w3-button w3-green w3-margin-right w3-margin-bottom"
              onClick={exportPDF}
            >
              Vie PDF-muodossa
            </button>
            <button
              className="w3-button w3-blue w3-margin-bottom"
              onClick={exportExcel}
            >
              Vie Excel-muodossa
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerDashboard;
