// Добавь рядом с импортами
import React, { useState, useEffect } from "react";
import api from "../api/api";

const AdminCourseSchedule: React.FC<{ courses: any[] }> = ({ courses }) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [sessions, setSessions] = useState<any[]>([]);
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("19:00");
  const [endTime, setEndTime] = useState("20:30");

  const toggleWeekday = (day: number) => {
    setWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleGenerateSchedule = async () => {
    if (!selectedCourseId) return alert("Valitse kurssi ensin!");
    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        `/admin/courses/${selectedCourseId}/sessions/generate`,
        { weekdays, startTime, endTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Luotu ${res.data.count} harjoituskertaa!`);
      fetchSessions(selectedCourseId);
    } catch (err: any) {
      console.error("Error generating sessions:", err);
      alert("Virhe luodessa aikataulua");
    }
  };

  const fetchSessions = async (courseId: string) => {
    try {
      const { data } = await api.get(`/admin/courses/${courseId}/sessions`);
      setSessions(data);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
  };

  const handleDeleteSession = async (sessionId: number) => {
    if (!window.confirm("Poistetaanko tämä harjoituskerta?")) return;
    try {
      await api.delete(`/admin/sessions/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      console.error("Error deleting session:", err);
    }
  };

  useEffect(() => {
    if (selectedCourseId) fetchSessions(selectedCourseId);
  }, [selectedCourseId]);

  return (
    <div className="w3-container w3-margin-top">
      <div
        className="w3-card w3-white w3-padding w3-round-large"
        style={{
          maxWidth: "768px", // ограничение по ширине
          margin: "0 auto", // выравнивание по центру
          width: "95%", // адаптивная ширина на маленьких экранах
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)", // немного глубины
        }}
      >
        <h3 className="w3-center">Kurssien aikataulut</h3>

        {/* Выбор курса */}
        <label className="w3-text-dark-grey">
          <b>Valitse kurssi:</b>
        </label>
        <select
          className="w3-select w3-border w3-margin-bottom"
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
        >
          <option value="">-- Valitse kurssi --</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>

        {/* Выбор дней недели */}
        <div className="w3-margin-bottom">
          <label>
            <b>Viikonpäivät:</b>
          </label>
          <br />
          {["Ma", "Ti", "Ke", "To", "Pe", "La", "Su"].map((day, index) => (
            <label key={day} className="w3-margin-right">
              <input
                type="checkbox"
                className="w3-check"
                checked={weekdays.includes(index + 1)}
                onChange={() => toggleWeekday(index + 1)}
              />{" "}
              {day}
            </label>
          ))}
        </div>

        {/* Время начала и конца */}
        <div className="w3-row-padding">
          <div className="w3-half">
            <label>
              <b>Alkamisaika:</b>
            </label>
            <input
              type="time"
              className="w3-input w3-border"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="w3-half">
            <label>
              <b>Loppumisaika:</b>
            </label>
            <input
              type="time"
              className="w3-input w3-border"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        <button
          className="w3-button w3-green w3-margin-top"
          onClick={handleGenerateSchedule}
          disabled={!selectedCourseId || weekdays.length === 0}
        >
          Luo aikataulu
        </button>
      </div>

      {/* Список тренировок */}
      {sessions.length > 0 && (
        <div className="w3-card w3-white w3-padding w3-round-large w3-margin-top">
          <h4 className="w3-center">Luodut harjoituskerrat</h4>
          <table className="w3-table-all w3-hoverable w3-margin-top">
            <thead className="w3-light-grey">
              <tr>
                <th>Päivämäärä</th>
                <th>Viikonpäivä</th>
                <th>Toiminnot</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id}>
                  <td>{new Date(s.date).toLocaleDateString("fi-FI")}</td>
                  <td>
                    {["Su", "Ma", "Ti", "Ke", "To", "Pe", "La"][s.weekday]}
                  </td>
                  <td>
                    <button
                      className="w3-button w3-small w3-red w3-round"
                      onClick={() => handleDeleteSession(s.id)}
                    >
                      Poista
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCourseSchedule;
