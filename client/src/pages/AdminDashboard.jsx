// client/src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import AdminCourseSchedule from "../components/AdminCourseSchedule";
import {getCourses} from "../api/courses.ts";
import {CourseRow} from "../components/admin/CourseRow.tsx";

function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [trialBookings, setTrialBookings] = useState([]);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  // state for assigning a trainer to a course
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTrainer, setSelectedTrainer] = useState("");
  // state for membershipPayments
  const [memberships, setMemberships] = useState([]);
  //state for courses
  const [showInactive, setShowInactive] = useState(false);

  const navigate = useNavigate();

  // Fetch users
  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch memberships
    const fetchMemberships = async () => {
        try {
            const {data} = await api.get("/membership/admin/all")
            setMemberships(data);
        } catch (err) {
            console.error("Failed to load memberships", err);
        }
    };

  // Fetch enrollments
  const fetchEnrollments = async () => {
    try {
      const { data } = await api.get("/enrollments");
      setEnrollments(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch trial bookings
  const fetchTrialBookings = async () => {
    try {
      const { data } = await api.get("/admin/trial-bookings");
      setTrialBookings(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const { data } = await api.get("/admin/contact");
      setMessages(data);
    } catch (err) {
      console.error(err);
      setError("Virhe viestien latauksessa.");
    }
  };

  // Fetch trainers
  const fetchTrainers = async () => {
    try {
      const { data } = await api.get("/admin/trainers");
      setTrainers(data);
    } catch (err) {
      console.error("Error loading trainers:", err);
    }
  };

  // Fetch courses
    const fetchCourses = async (active) => {
        try {
            const data = await getCourses(active);
            setCourses(data);
        } catch (err) {
            console.error("Error loading courses:", err);
        }
    };

  // On component mount, check auth and fetch data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch admin data
    const fetchAdminData = async () => {
      try {
        const { data } = await api.get("/admin/profile");
        if (data.role !== "admin") {
          navigate("/");
          return;
        }

        setAdmin(data);
          void fetchUsers();
          void fetchEnrollments();
          void fetchTrialBookings();
          void fetchMessages();
          void fetchTrainers();
          void fetchCourses();
          void fetchMemberships();
      } catch (err) {
        console.error(err);
        setError("Ошибка при загрузке данных администратора.");
      }
    };

      void fetchAdminData();
  }, [navigate]);

  // 🔹 4. Handle user deletion
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Poistetaanko käyttäjä?")) return;

    try {
      await api.delete(`/admin/users/${id}`);

      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 5. Handle trial deletion
  const handleDeleteTrial = async (id) => {
    if (!window.confirm("Poistetaanko käyttäjä kokeilusta?")) return;

    try {
      await api.delete(`/admin/trial-bookings/${id}`);

      // Обновить состояние:
      setTrialBookings((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error deleting trial:", err);
      alert("Virhe kokeilijan poistossa");
    }
  };

  // 🔹 6. Get user enrollments
  const getUserEnrollments = (userId) =>
    enrollments.filter((e) => e.user.id === userId);

  // 🔹 7. Handle enrollment paid
  const handleToggleConfirm = async (enrollmentId) => {
    try {
      await api.patch(`/enrollments/${enrollmentId}/confirm`);

      setEnrollments((prev) =>
        prev.map((e) =>
          e.id === enrollmentId
            ? {
                ...e,
                paymentConfirmedByAdmin: true,
                adminConfirmedAt: new Date().toISOString(),
              }
            : e
        )
      );
    } catch (err) {
      console.error(err);
      alert("Maksun vahvistaminen epäonnistui. Yritä uudelleen.");
    }
  };

  // 🔹 7.1. Handle membership paid
    const handleToggleMembershipConfirm = async (paymentId) => {
        try {
            // вызываем существующий роут
            const { data } = await api.post("/membership/admin/confirm", { paymentId });

            // data.payment — обновлённый объект (см. контроллер)
            setMemberships((prev) =>
                prev.map((m) => (m.id === paymentId ? data.payment : m))
            );
        } catch (err) {
            console.error("Error confirming membership:", err);
            alert("Vahvistus epäonnistui.");
        }
    };

  // 🔹 8. Handle message reply
  if (error)
    return (
      <div className="w3-panel w3-red w3-padding">
        <p>{error}</p>
      </div>
    );

  // 🔹 9. Render admin dashboard
  if (!admin)
    return (
      <div className="w3-container w3-center w3-padding-32">
        <p>Ladataan...</p>
      </div>
    );

  // 🔹 10. Handlers for creating and deleting a trainer
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreateTrainer = async () => {
    try {
      await api.post("/admin/trainers", form);
      setShowModal(false);
        void fetchTrainers();
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phoneNumber: "",
      });
    } catch (err) {
      console.error("Virhe valmentajan luomisessa:", err);
    }
  };

  const handleDeleteTrainer = async (id) => {
    if (!window.confirm("Poista tämä valmentaja?")) return;
    try {
      await api.delete(`/admin/trainers/${id}`);
        void fetchTrainers();
    } catch (err) {
      console.error("Virhe poistettaessa valmentajaa:", err);
    }
  };
  //-----end of handlers and state for creating a trainer

  // Function to download users PDF with authentication and trigger download
  const downloadUsersPdf = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Kirjaudu sisään ladataksesi PDF:n.");
      return;
    }
    try {
      const response = await api.get("/admin/users/pdf", {
        responseType: "blob",
      });
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "users.pdf";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 0);
    } catch (err) {
      alert("PDF lataus epäonnistui");
      console.error(err);
    }
  };

  // 🔹 11. Handler for deleting a message
  const handleDeleteMessage = async (id) => {
    if (!window.confirm("Poistetaanko viesti?")) return;

    try {
      await api.delete(`/admin/contact/${id}`);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Error deleting message:", err);
      alert("Virhe viestin poistossa");
    }
  };

  // 🔹 12. Handler for assigning a trainer to a course
  const handleAssignTrainer = async () => {
    if (!selectedCourse || !selectedTrainer) return;
    try {
      const { data } = await api.post(
        `/admin/courses/${selectedCourse}/assign-trainer`,
        { trainerId: selectedTrainer }
      );
      alert("✅ Valmentaja on onnistuneesti määritetty kurssille!");

      // Обновляем локальный список тренеров
      setTrainers((prevTrainers) =>
        prevTrainers.map((t) =>
          t.id === selectedTrainer
            ? {
                ...t,
                courses: [...t.courses, data.course], // добавляем новый курс
              }
            : t
        )
      );

      // Сброс выбора
      setSelectedCourse("");
      setSelectedTrainer("");
    } catch (err) {
      console.error("Error when assigning a coach:", err);
      alert("❌ Error when assigning a coach. Check the console.");
    }
  };
  // 🔹 13.  Handler for unassigning a trainer from a course
  const handleUnassignCourse = async (trainerId, courseId) => {
    if (!window.confirm("Haluatko varmasti poistaa valmentajan kurssilta?"))
      return;

    try {
      const { data } = await api.delete(
        `/admin/trainers/${trainerId}/courses/${courseId}`
      );
      console.log("Trainer unassigned:", data);

      // Set updated trainers state
      setTrainers((prev) =>
        prev.map((t) =>
          t.id === trainerId
            ? { ...t, courses: t.courses.filter((c) => c.id !== courseId) }
            : t
        )
      );
    } catch (err) {
      console.error("Virhe poistettaessa kurssilta:", err);
      alert("Virhe poistettaessa valmentajaa kurssilta");
    }
  };

    // 🔹 14. Handler for deleting users enrollment
    const handleDeleteEnrollment = async (enrollmentId, userId) => {
        if (
            !window.confirm(
                "Haluatko varmasti poistaa käyttäjän tältä kurssilta?"
            )
        ) {
            return;
        }

        try {
            await api.delete(`/enrollments/${enrollmentId}`);

            // обновляем локальный стейт
            setEnrollments((prev) =>
                prev.filter((e) => e.id !== enrollmentId)
            );
        } catch (err) {
            console.error("Enrollment delete failed:", err);
            alert("Kurssilta poistaminen epäonnistui.");
        }
    };

  return (
    <div
      className="w3-container w3-light-grey w3-padding-32"
      style={{ minHeight: "100vh" }}
    >
      <div className="w3-card w3-white w3-padding w3-round-large w3-margin-bottom">
        <h2 className="w3-center">Hallintapaneeli</h2>
        <p className="w3-center w3-text-grey">
          {admin.name} ({admin.email}) | Rooli:{" "}
          <span className="w3-tag w3-red w3-round">Admin</span>
        </p>
      </div>
      {/* users */}
      <div className="w3-card w3-white w3-padding w3-round-large w3-margin-bottom">
        <h3>Käyttäjät</h3>
        <button
          className="w3-button w3-teal  w3-margin-bottom"
          onClick={downloadUsersPdf}
        >
          Lataa PDF käyttäjistä
        </button>
        <table className="w3-table w3-bordered w3-striped w3-small responsive-table">
          <thead className="w3-light-grey">
            <tr>
              <th>Nimi</th>
              <th>Email</th>
              <th>Puhelin</th>
              <th>Rekisteröity pvm</th>
              <th>Jäsenmaksu</th>
              <th>Kurssi</th>
              <th>Toiminnot</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td data-label="Nimi">
                  {`${u.firstName || ""} ${u.lastName || ""}`.trim() ||
                    u.name ||
                    "—"}
                </td>
                <td data-label="Email">{u.email}</td>
                <td data-label="Puhelin">{u.phoneNumber || "—"}</td>
                <td data-label="Rekisteröity pvm">
                  {new Date(u.createdAt).toLocaleDateString("fi-FI")}
                </td>
                  <td data-label="Jäsenmaksu">
                      {(() => {
                          const userMemberships = memberships
                              .filter(m => m.user?.id === u.id)
                              .sort((a, b) => b.year - a.year);

                          if (userMemberships.length === 0) {
                              return <span className="w3-text-red">❌ Ei maksettu</span>;
                          }

                          return userMemberships.map(m => (
                              <div key={m.id} style={{ marginBottom: "8px" }}>
                                  {/* STATUS TAG */}
                                  {m.status === "unpaid" && (
                                      <span className="w3-text-red">
                        ❌ {m.year}: Ei maksettu
                    </span>
                                  )}

                                  {m.status === "pending" && (
                                      <>
                                          <div
                                              className="w3-tag w3-round w3-small"
                                              style={{
                                                  background: "#f1c40f",
                                                  color: "white",
                                                  marginBottom: "4px",
                                                  display: "inline-block",
                                              }}
                                          >
                                              {m.year}: Käsittelyssä
                                          </div>

                                          {/* CONFIRMATION CHECKBOX (ONLY FOR PENDING) */}
                                          <div className="w3-margin-top">
                                              <label
                                                  style={{
                                                      display: "flex",
                                                      alignItems: "center",
                                                      gap: "8px",
                                                  }}
                                              >
                                                  Vahvista maksu →
                                                  <input
                                                      type="checkbox"
                                                      onChange={() =>
                                                          handleToggleMembershipConfirm(m.id)
                                                      }
                                                      style={{
                                                          appearance: "none",
                                                          WebkitAppearance: "none",
                                                          width: "18px",
                                                          height: "18px",
                                                          border: "2px solid #555",
                                                          borderRadius: "4px",
                                                          backgroundColor: "#fff",
                                                          cursor: "pointer",
                                                      }}
                                                  />
                                              </label>
                                          </div>
                                      </>
                                  )}

                                  {m.status === "paid" && (
                                      <div
                                          className="w3-tag w3-round w3-small"
                                          style={{
                                              background: "#4CAF50",
                                              color: "white",
                                              display: "inline-block",
                                          }}
                                      >
                                          {m.year}: Maksettu
                                      </div>
                                  )}
                              </div>
                          ));
                      })()}
                  </td>
                <td data-label="Kurssi">
                  {getUserEnrollments(u.id).length === 0 ? (
                    <em>Ei ole rekisteröintia</em>
                  ) : (
                    getUserEnrollments(u.id).map((enr) => (
                      <div
                        key={enr.id}
                        className="w3-padding-small w3-border w3-round-small "
                      >
                        <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "8px",
                            }}
                        >
                          <div>
                            <strong>Kurssi:</strong> {enr.course.title}
                            <span className="w3-small w3-text-grey">
                            {" "}({enr.course.season})
                              {/* TODO: include course.season from API instead of client-side workaround */}
                          </span>
                          </div>
                          {/* 🗑️ ADMIN: remove user from course */}
                          {admin && (
                              <button
                                  className="w3-button  w3-round w3-hover-red"
                                  title="Poista käyttäjä kurssilta"
                                  onClick={() => handleDeleteEnrollment(enr.id, u.id)}
                                  style={{
                                    padding: "4px 8px",
                                    backgroundColor: "transparent",
                                    color: "#c0392b",
                                    flexShrink: 0,
                                  }}
                              >
                                <i className="fa fa-trash"></i>
                              </button>
                          )}
                        </div>

                        <div>
                          <strong>Summa:</strong> €{enr.invoiceAmount}
                        </div>

                        <div>
                          <strong>Maksun tilanne:</strong>{" "}
                          <span
                            className={`w3-tag w3-round ${
                              enr.invoicePaid ? "w3-green" : "w3-yellow"
                            }`}
                          >
                            {enr.invoicePaid
                              ? "✅ ilmoitettu maksusta"
                              : "Kääsitellään"}
                          </span>
                        </div>
                        <div>
                          <strong>Maksun vahvistus:</strong>{" "}
                          <span
                            className={`w3-tag w3-round ${
                              enr.paymentConfirmedByAdmin
                                ? "w3-green"
                                : "w3-orange"
                            }`}
                          >
                            {enr.paymentConfirmedByAdmin
                              ? "✅ maksu hyvitetty tilille"
                              : "Tarvitse tarkistusta"}
                          </span>
                        </div>

                        {!enr.invoicePaid && !enr.paymentConfirmedByAdmin && (
                            <div className="w3-small w3-text-grey w3-margin-top">
                              Odottaa käyttäjän maksuilmoitusta
                            </div>
                        )}

                          {/* ⬇️ ЧЕК-БОКС ТОЛЬКО ЕСЛИ ПОДТВЕРЖДЕНО ПОЛЬЗОВАТЕЛЕМ И НЕ ПОДТВЕРЖДЕНО АДМИНОМ */}
                        {enr.invoicePaid && !enr.paymentConfirmedByAdmin && (
                              <div className="w3-margin-top">
                                  <label
                                      style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "8px",
                                      }}
                                  >
                                      Vahvista maksun vastaanottaminen →
                                      <input
                                          type="checkbox"
                                          onChange={() => handleToggleConfirm(enr.id)}
                                          style={{
                                              appearance: "none",
                                              WebkitAppearance: "none",
                                              width: "18px",
                                              height: "18px",
                                              border: "2px solid #555",
                                              borderRadius: "4px",
                                              backgroundColor: "#ffffff",
                                              cursor: "pointer",
                                          }}
                                      />
                                  </label>
                              </div>
                          )}

                      </div>
                    ))
                  )}
                </td>
                <td data-label="Toiminnot">
                  <button
                    className="w3-button w3-small w3-red w3-round"
                    onClick={() => handleDeleteUser(u.id)}
                    disabled={u.role === "admin"}
                  >
                    <i className="fa fa-trash"></i> Poista käyttäjä
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* trials */}
      <div className="w3-card w3-white w3-padding w3-round-large w3-margin-bottom">
        <h3>KN kokeilijat</h3>
        <table className="w3-table w3-bordered w3-striped w3-small responsive-table">
          <thead className="w3-light-grey">
            <tr>
              <th>Nimi</th>
              <th>Email</th>
              <th>Puhelin</th>
              <th>Rekisteröity pvm</th>
              <th>Toiminnot</th>
            </tr>
          </thead>
          <tbody>
            {trialBookings.map((t) => (
              <tr key={t.id}>
                <td data-label="Nimi">
                  {t.firstName} {t.lastName}
                </td>
                <td data-label="Email">{t.email}</td>
                <td data-label="Puhelin">{t.phone}</td>
                <td data-label="Rekisteröity pvm">
                  {new Date(t.createdAt).toLocaleDateString("fi-FI")}
                </td>
                <td data-label="Toiminnot">
                  <button
                    onClick={() => handleDeleteTrial(t.id)}
                    className="w3-button w3-small w3-red w3-round"
                  >
                    <i className="fa fa-trash"></i> Poista kokeilija
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Saapuneet viestit */}
      <div className="w3-card w3-white w3-padding w3-round-large w3-margin-bottom">
        <h3>Saapuneet viestit</h3>
        <table className="w3-table w3-bordered w3-striped w3-small responsive-table">
          <thead>
            <tr>
              <th>Nimi</th>
              <th>Email</th>
              <th>Viesti</th>
              <th>Päivä</th>
              <th>Vastaus</th>
              <th>Toiminnot</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((m) => (
              <tr key={m.id}>
                <td>
                  {m.firstName && m.lastName
                    ? `${m.firstName} ${m.lastName}`
                    : m.name}
                </td>
                <td>{m.email}</td>
                <td>{m.message}</td>
                <td>{new Date(m.createdAt).toLocaleDateString("fi-FI")}</td>
                <td>
                  {m.adminReply || (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const reply = e.target.reply.value;
                        await api.post(`/admin/contact/${m.id}/reply`, {
                          reply,
                        });
                          void fetchMessages();
                      }}
                    >
                      <input
                        name="reply"
                        placeholder="Kirjoita vastaus"
                        required
                      />
                      <button
                        type="submit"
                        className="w3-button w3-teal w3-small"
                      >
                        Lähetä
                      </button>
                    </form>
                  )}
                </td>
                <td>
                  <button
                    onClick={() => handleDeleteMessage(m.id)}
                    className="w3-button w3-small w3-red w3-round"
                  >
                    <i className="fa fa-trash"></i> Poista viesti
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Courses */}
        <div className="w3-card w3-white w3-padding w3-round-large w3-margin-bottom">
            <h3>Kurssit</h3>

            <label className="w3-margin-bottom" style={{ display: "block" }}>
                <input
                    type="checkbox"
                    checked={showInactive}
                    onChange={() => setShowInactive(v => !v)}
                />{" "}
                Näytä myös ei-aktiiviset
            </label>

            <table className="w3-table w3-bordered w3-striped w3-small">
                <thead className="w3-light-grey">
                <tr>
                    <th>Kurssi</th>
                    <th>Kausi</th>
                    <th>Hinta</th>
                    <th>Alkaa</th>
                    <th>Päättyy</th>
                    <th>Tila</th>
                    <th>Toiminnot</th>
                </tr>
                </thead>

                <tbody>
                {courses.map(c => (
                    <CourseRow
                        key={c.id}
                        course={c}
                        onUpdated={fetchCourses}
                    />
                ))}
                </tbody>
            </table>
        </div>

      {/* Trainers Section */}
      <div className="w3-card w3-white w3-padding w3-round-large w3-margin-bottom">
        <h3>Valmentajat</h3>
        <button
          className="w3-button w3-green w3-margin-bottom"
          onClick={() => setShowModal(true)}
        >
          <i className="fa fa-user-plus w3-margin-right"></i>Lisää uusi
          valmentaja
        </button>
        {showModal && (
          <div
            className="w3-modal"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start", // можно "center", если вертикально тоже по центру
              paddingTop: "50px", // отступ сверху
            }}
          >
            <div
              className="w3-card w3-white w3-padding w3-round-large"
              style={{ maxWidth: 400, width: "100%" }}
            >
              <h3>Luo valmentaja</h3>
              <input
                className="w3-input w3-border w3-margin-bottom"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Etunimi"
              />
              <input
                className="w3-input w3-border w3-margin-bottom"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Sukunimi"
              />
              <input
                className="w3-input w3-border w3-margin-bottom"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
              />
              <input
                className="w3-input w3-border w3-margin-bottom"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                placeholder="Puhelin"
              />
              <input
                className="w3-input w3-border w3-margin-bottom"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Salasana"
                type="password"
              />
              <div>
                <button
                  className="w3-button w3-teal w3-margin-right"
                  onClick={handleCreateTrainer}
                >
                  Luoda
                </button>
                <button
                  className="w3-button w3-light-grey"
                  onClick={() => setShowModal(false)}
                >
                  Peruuta
                </button>
              </div>
            </div>
          </div>
        )}
        <table className="w3-table w3-bordered w3-striped w3-small responsive-table">
          <thead className="w3-light-grey">
            <tr>
              <th>Nimi</th>
              <th>Sähköposti</th>
              <th>Puhelin</th>
              <th>Rekisteröity pvm</th>
              <th>Kurssit</th>
              <th>Toiminnot</th>
            </tr>
          </thead>
          <tbody>
            {trainers.map((t) => (
              <tr key={t.id}>
                <td>
                  {t.firstName} {t.lastName}
                </td>
                <td>{t.email}</td>
                <td>{t.phoneNumber}</td>
                <td>
                  {t.createdAt
                    ? new Date(t.createdAt).toLocaleDateString("fi-FI")
                    : "—"}
                </td>
                <td>
                  {t.courses?.length > 0 ? (
                    t.courses.map((course) => (
                      <div
                        key={course.id}
                        className="w3-tag w3-teal w3-round w3-small w3-padding-small w3-animate-opacity"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "185px",
                          marginBottom: "4px",
                        }}
                      >
                        <span
                          key={course.id}
                          className="w3-tag w3-teal w3-round w3-small"
                          style={{ padding: "4px 8px" }}
                        >
                          {course.title}
                          <button
                            className="w3-button w3-transparent w3-small w3-hover-red w3-padding-small"
                            style={{
                              marginLeft: "4px",
                              lineHeight: "1",
                              border: "none",
                              cursor: "pointer",
                            }}
                            title="Poista kurssilta"
                            onClick={() =>
                              handleUnassignCourse(t.id, course.id)
                            }
                          >
                            ❌
                          </button>
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="w3-text-grey">Ei vielä kursseja</span>
                  )}
                </td>
                <td data-label="Toiminnot">
                  <button
                    onClick={() => handleDeleteTrainer(t.id)}
                    className="w3-button w3-small w3-red w3-round"
                  >
                    <i className="fa fa-trash"></i> Poista valmentaja
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Assign Trainer to Course Section ---*/}
      <div className="w3-container w3-margin-top">
        <div
          className="w3-card w3-round-large w3-white w3-padding-large"
          style={{
            maxWidth: "768px", // ограничение по ширине
            margin: "0 auto", // выравнивание по центру
            width: "95%", // адаптивная ширина на маленьких экранах
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)", // немного глубины
          }}
        >
          <h3 className="w3-text-teal">
            <i className="fa fa-user-plus w3-margin-right"></i>
            Määritä valmentaja kurssille
          </h3>

          {/* --Course selection-- */}
          <div className="w3-section">
            <label className="w3-text-dark-grey">
              <b>Valitse kurssi:</b>
            </label>
            <select
              className="w3-select w3-border"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">-- Valitse kurssi --</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {/*-- Choosing a coach --*/}
          <div className="w3-section">
            <label className="w3-text-dark-grey">
              <b>Valitse valmentaja:</b>
            </label>
            <select
              className="w3-select w3-border"
              value={selectedTrainer}
              onChange={(e) => setSelectedTrainer(Number(e.target.value))}
            >
              <option value="">-- Valitse valmentaja --</option>
              {trainers.map((trainer) => (
                <option key={trainer.id} value={trainer.id}>
                  {trainer.firstName} {trainer.lastName}
                </option>
              ))}
            </select>
          </div>

          {/*-- Button --*/}
          <div className="w3-center w3-margin-top">
            <button
              className="w3-button w3-teal w3-round-large w3-padding-large"
              onClick={handleAssignTrainer}
              disabled={!selectedCourse || !selectedTrainer}
            >
              <i className="fa fa-check w3-margin-right"></i>
              Määritä
            </button>
          </div>
        </div>
      </div>

      {/* --- Course Schedule Generation Section --- */}
      <AdminCourseSchedule courses={courses} />
    </div>
  );
}

export default AdminDashboard;
