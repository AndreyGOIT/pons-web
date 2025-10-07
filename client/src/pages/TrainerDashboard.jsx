// client/src/pages/TrainerDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

const TrainerDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [filterDates, setFilterDates] = useState({ start: "", end: "" });

  useEffect(() => {
    axios
      .get("/api/trainer/courses", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setCourses(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleCourseSelect = (courseId) => {
    setSelectedCourse(courseId);
    axios
      .get(`/api/trainer/courses/${courseId}/attendances`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        setSessions(res.data.sessions);
        setEnrollments(res.data.course.enrollments);
        const initialData = {};
        res.data.course.enrollments.forEach((e) => {
          initialData[e.user.id] = {};
          res.data.attendances.forEach((a) => {
            if (a.enrollment.id === e.id) {
              initialData[e.user.id][a.session.id] = a.present;
            }
          });
        });
        setAttendanceData(initialData);
        setFilterDates({
          start: res.data.course.startDate,
          end: res.data.course.endDate,
        });
      })
      .catch((err) => console.error(err));
  };

  const handleToggleAttendance = (userId, sessionId) => {
    const newValue = !attendanceData[userId][sessionId];
    setAttendanceData((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [sessionId]: newValue },
    }));

    axios
      .post(
        `/api/trainer/courses/${selectedCourse}/attendances/${sessionId}/toggle`,
        { userId, present: newValue },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      )
      .catch((err) => console.error(err));
  };

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

  const exportExcel = () => {
    const data = enrollments.map((e) => {
      const row = { User: `${e.user.firstName} ${e.user.lastName}` };
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
    <div className="w3-container">
      <h1>Trainer Dashboard</h1>

      <label>Valitse kurssi:</label>
      <select onChange={(e) => handleCourseSelect(e.target.value)}>
        <option value="">--Select Course--</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>

      {selectedCourse && (
        <>
          <div className="w3-margin-top">
            <label>Suodata päivämäärien mukaan:</label>
            <input
              type="date"
              value={filterDates.start}
              onChange={(e) =>
                setFilterDates((prev) => ({ ...prev, start: e.target.value }))
              }
            />
            <input
              type="date"
              value={filterDates.end}
              onChange={(e) =>
                setFilterDates((prev) => ({ ...prev, end: e.target.value }))
              }
            />
          </div>

          <table className="w3-table w3-bordered w3-striped w3-margin-top">
            <thead>
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
                      <td key={s.id}>
                        <input
                          type="checkbox"
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
