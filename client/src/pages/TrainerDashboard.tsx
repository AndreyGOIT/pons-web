import React, { useEffect, useState, ChangeEvent } from "react";
import api from "../api/api";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

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
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({});
  const [filterDates, setFilterDates] = useState<{
    start: string;
    end: string;
  }>({ start: "", end: "" });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Используем api.ts для получения только курсов тренера
        const { data } = await api.get<Course[]>("/trainer/courses");
        setCourses(data);
      } catch (err) {
        console.error("Ошибка при загрузке курсов:", err);
      }
    };
    fetchCourses();
  }, []);

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
      setEnrollments(data.course.enrollments || []);

      const initialAttendanceData: AttendanceData = {};
      data.course.enrollments.forEach((enrollment) => {
        initialAttendanceData[enrollment.user.id] = {};
        data.attendances.forEach((attendance) => {
          if (attendance.enrollment.id === enrollment.id) {
            initialAttendanceData[enrollment.user.id][attendance.session.id] =
              attendance.present;
          }
        });
      });
      setAttendanceData(initialAttendanceData);

      setFilterDates({
        start: data.course.startDate,
        end: data.course.endDate,
      });
    } catch (error) {
      console.error("Ошибка при загрузке посещаемости:", error);
    }
  };

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
    } catch (err) {
      console.error("Ошибка при обновлении посещаемости:", err);
    }
  };

  const exportPDF = (): void => {
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

  const exportExcel = (): void => {
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
    <div className="w3-container w3-margin-top">
      <div className="w3-card w3-padding w3-light-grey">
        <label className="w3-text-dark-grey">
          <b>Valitse kurssi:</b>
        </label>
        <select
          className="w3-select w3-border"
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            handleCourseSelect(e.target.value)
          }
        >
          <option value="">--Select Course--</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {selectedCourse && (
        <>
          <div className="w3-card w3-padding w3-light-grey w3-margin-top">
            <label className="w3-text-dark-grey">
              <b>Suodata päivämäärien mukaan:</b>
            </label>
            <input
              type="date"
              className="w3-input w3-border w3-margin-bottom"
              value={filterDates.start}
              onChange={(e) =>
                setFilterDates((prev) => ({ ...prev, start: e.target.value }))
              }
            />
            <input
              type="date"
              className="w3-input w3-border"
              value={filterDates.end}
              onChange={(e) =>
                setFilterDates((prev) => ({ ...prev, end: e.target.value }))
              }
            />
          </div>

          <table className="w3-table-all w3-bordered w3-striped w3-margin-top w3-hoverable">
            <thead className="w3-teal">
              <tr>
                <th>Käyttäjä</th>
                {sessions
                  .filter(
                    (s) =>
                      new Date(s.date) >= new Date(filterDates.start) &&
                      new Date(s.date) <= new Date(filterDates.end)
                  )
                  .map((s) => (
                    <th key={s.id}>{new Date(s.date).toLocaleDateString()}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e.user.id}>
                  <td>
                    {e.user.firstName} {e.user.lastName}
                  </td>
                  {sessions
                    .filter(
                      (s) =>
                        new Date(s.date) >= new Date(filterDates.start) &&
                        new Date(s.date) <= new Date(filterDates.end)
                    )
                    .map((s) => (
                      <td key={s.id} className="w3-center">
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

          <div className="w3-margin-top">
            <button
              className="w3-button w3-green w3-margin-right"
              onClick={exportPDF}
            >
              Vie PDF-muodossa
            </button>
            <button className="w3-button w3-blue" onClick={exportExcel}>
              Vie Excel-muodossa
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TrainerDashboard;

// initial version:
// client/src/pages/TrainerDashboard.jsx
// import React, { useEffect, useState, ChangeEvent } from "react";
// import api from "../api/api";
// import { jsPDF } from "jspdf";
// import * as XLSX from "xlsx";

// // TypeScript interfaces
// interface User {
//   id: number;
//   firstName: string;
//   lastName: string;
//   email?: string;
// }

// interface Enrollment {
//   id: number;
//   user: User;
//   [key: string]: any; // for extra fields if needed
// }

// interface Session {
//   id: number;
//   date: string;
//   [key: string]: any; // for extra fields if needed
// }

// interface Course {
//   id: number;
//   title: string;
//   description: string;
//   price: number;
//   startDate: string;
//   endDate: string;
//   enrollments?: Enrollment[];
// }

// interface AttendanceData {
//   [userId: number]: {
//     [sessionId: number]: boolean;
//   };
// }

// interface Attendance {
//   id: number;
//   present: boolean;
//   session: Session;
//   enrollment: Enrollment;
// }

// interface CourseAttendanceResponse {
//   course: Course & { enrollments: Enrollment[] };
//   sessions: Session[];
//   attendances: Attendance[];
// }

// const TrainerDashboard: React.FC = () => {
//   const [courses, setCourses] = useState<Course[]>([]);
//   const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
//   const [sessions, setSessions] = useState<Session[]>([]);
//   const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
//   const [attendanceData, setAttendanceData] = useState<AttendanceData>({});
//   const [filterDates, setFilterDates] = useState<{
//     start: string;
//     end: string;
//   }>({ start: "", end: "" });

//   useEffect(() => {
//     const fetchCourses = async (): Promise<Course[]> => {
//       const { data } = await api.get<Course[]>("/courses");
//       return data;
//     };
//     fetchCourses()
//       .then((data) => {
//         setCourses(data);
//         console.log("Courses on trainer page: ", data);
//       })
//       .catch((err) => {
//         console.error("Error: ", err);
//       });
//   }, []);

//   const handleCourseSelect = async (courseId: string) => {
//     if (!courseId) {
//       setSelectedCourse(null);
//       setSessions([]);
//       setEnrollments([]);
//       setAttendanceData({});
//       return;
//     }

//     const id = Number(courseId);
//     setSelectedCourse(id);

//     try {
//       const { data } = await api.get<CourseAttendanceResponse>(
//         `/trainer/courses/${courseId}/attendances`
//       );

//       // Сохраняем сессии и участников курса
//       setSessions(data.sessions);
//       setEnrollments(data.course.enrollments);

//       // Формируем объект посещаемости
//       const initialAttendanceData: AttendanceData = {};
//       data.course.enrollments.forEach((enrollment) => {
//         initialAttendanceData[enrollment.user.id] = {};
//         data.attendances.forEach((attendance) => {
//           if (attendance.enrollment.id === enrollment.id) {
//             initialAttendanceData[enrollment.user.id][attendance.session.id] =
//               attendance.present;
//           }
//         });
//       });
//       setAttendanceData(initialAttendanceData);

//       // Устанавливаем фильтр по датам курса
//       setFilterDates({
//         start: data.course.startDate,
//         end: data.course.endDate,
//       });

//       console.log("Course selected:", data);
//     } catch (error) {
//       console.error("Ошибка при загрузке посещаемости:", error);
//     }
//   };

//   const handleToggleAttendance = async (userId: number, sessionId: number) => {
//     const newValue = !attendanceData[userId]?.[sessionId];
//     setAttendanceData((prev) => ({
//       ...prev,
//       [userId]: { ...prev[userId], [sessionId]: newValue },
//     }));

//     try {
//       await api.post(
//         `/trainer/courses/${selectedCourse}/attendances/${sessionId}/toggle`,
//         { userId, present: newValue }
//       );
//     } catch (err) {
//       console.error("Ошибка при обновлении посещаемости:", err);
//     }
//   };

//   const exportPDF = (): void => {
//     const doc = new jsPDF();
//     doc.text(`Attendance Report for Course`, 10, 10);
//     let y = 20;
//     enrollments.forEach((e) => {
//       let row = `${e.user.firstName} ${e.user.lastName}`;
//       sessions.forEach((s) => {
//         if (
//           new Date(s.date) >= new Date(filterDates.start) &&
//           new Date(s.date) <= new Date(filterDates.end)
//         ) {
//           row += ` | ${attendanceData[e.user.id]?.[s.id] ? "✔️" : "❌"}`;
//         }
//       });
//       doc.text(row, 10, y);
//       y += 10;
//     });
//     doc.save(`attendance_${selectedCourse}.pdf`);
//   };

//   const exportExcel = (): void => {
//     const data = enrollments.map((e) => {
//       const row: { [key: string]: string } = {
//         User: `${e.user.firstName} ${e.user.lastName}`,
//       };
//       sessions.forEach((s) => {
//         if (
//           new Date(s.date) >= new Date(filterDates.start) &&
//           new Date(s.date) <= new Date(filterDates.end)
//         ) {
//           row[new Date(s.date).toLocaleDateString()] = attendanceData[
//             e.user.id
//           ]?.[s.id]
//             ? "Present"
//             : "Absent";
//         }
//       });
//       return row;
//     });
//     const ws = XLSX.utils.json_to_sheet(data);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Attendance");
//     XLSX.writeFile(wb, `attendance_${selectedCourse}.xlsx`);
//   };

//   return (
//     <>
//       <div className="w3-margin-top w3-padding w3-card w3-light-grey">
//         <label className="w3-text-dark-grey">
//           <b>Valitse kurssi:</b>
//         </label>
//         <select
//           className="w3-select w3-border"
//           onChange={(e: ChangeEvent<HTMLSelectElement>) =>
//             handleCourseSelect(e.target.value)
//           }
//         >
//           <option value="">--Select Course--</option>
//           {courses.map((c) => (
//             <option key={c.id} value={c.id}>
//               {c.title}
//             </option>
//           ))}
//         </select>
//       </div>

//       {selectedCourse && (
//         <>
//           <div className="w3-margin-top w3-padding w3-card w3-light-grey">
//             <label className="w3-text-dark-grey">
//               <b>Suodata päivämäärien mukaan:</b>
//             </label>
//             <input
//               type="date"
//               className="w3-input w3-border w3-margin-bottom"
//               value={filterDates.start}
//               onChange={(e: ChangeEvent<HTMLInputElement>) =>
//                 setFilterDates((prev) => ({ ...prev, start: e.target.value }))
//               }
//             />
//             <input
//               type="date"
//               className="w3-input w3-border"
//               value={filterDates.end}
//               onChange={(e: ChangeEvent<HTMLInputElement>) =>
//                 setFilterDates((prev) => ({ ...prev, end: e.target.value }))
//               }
//             />
//           </div>

//           <table className="w3-table-all w3-bordered w3-striped w3-margin-top w3-hoverable">
//             <thead className="w3-teal">
//               <tr>
//                 <th>Käyttäjä</th>
//                 {sessions
//                   .filter(
//                     (s) =>
//                       new Date(s.date) >= new Date(filterDates.start) &&
//                       new Date(s.date) <= new Date(filterDates.end)
//                   )
//                   .map((s) => (
//                     <th key={s.id}>{new Date(s.date).toLocaleDateString()}</th>
//                   ))}
//               </tr>
//             </thead>
//             <tbody>
//               {enrollments.map((e) => (
//                 <tr key={e.user.id}>
//                   <td>
//                     {e.user.firstName} {e.user.lastName}
//                   </td>
//                   {sessions
//                     .filter(
//                       (s) =>
//                         new Date(s.date) >= new Date(filterDates.start) &&
//                         new Date(s.date) <= new Date(filterDates.end)
//                     )
//                     .map((s) => (
//                       <td key={s.id} className="w3-center">
//                         <input
//                           type="checkbox"
//                           className="w3-check"
//                           checked={attendanceData[e.user.id]?.[s.id] || false}
//                           onChange={() =>
//                             handleToggleAttendance(e.user.id, s.id)
//                           }
//                         />
//                       </td>
//                     ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           <div className="w3-margin-top">
//             <button
//               className="w3-button w3-green w3-margin-right"
//               onClick={exportPDF}
//             >
//               Vie PDF-muodossa
//             </button>
//             <button className="w3-button w3-blue" onClick={exportExcel}>
//               Vie Excel-muodossa
//             </button>
//           </div>
//         </>
//       )}
//     </>
//   );
// };

// export default TrainerDashboard;
