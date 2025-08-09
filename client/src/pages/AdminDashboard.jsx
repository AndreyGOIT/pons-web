import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [trialBookings, setTrialBookings] = useState([]);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  // Fetch users
  const fetchUsers = async (token) => {
    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Ошибка получения списка пользователей");

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch enrollments
  const fetchEnrollments = async (token) => {
    try {
      const res = await fetch("/api/enrollments", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ убедись, что token реально есть
        },
      });
      if (!res.ok) throw new Error("Ошибка получения регистраций");

      const data = await res.json();
      setEnrollments(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch trial bookings
  const fetchTrialBookings = async (token) => {
    try {
      const res = await fetch("/api/admin/trial-bookings", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ убедись, что token реально есть
        },
      });
      if (!res.ok) throw new Error("Ошибка получения пробных бронирований");
      const data = await res.json();
      setTrialBookings(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch messages
  const fetchMessages = async (token) => {
    console.log(`🪪 Token for messages fetch: ${token}`);
    try {
      const res = await fetch("/api/admin/contact", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ убедись, что token реально есть
        },
      });
      if (!res.ok) throw new Error("Ошибка получения сообщений");

      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
      setError("Virhe viestien latauksessa.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch admin data
    const fetchAdminData = async () => {
      try {
        const res = await fetch("/api/admin/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Ошибка получения профиля");

        const data = await res.json();
        if (data.role !== "admin") {
          navigate("/");
          return;
        }

        setAdmin(data);
        fetchUsers(token);
        fetchEnrollments(token);
        fetchTrialBookings(token);
        fetchMessages(token);
      } catch (err) {
        console.error(err);
        setError("Ошибка при загрузке данных администратора.");
      }
    };

    fetchAdminData();
  }, [navigate]);

  // 🔹 4. Handle user deletion
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Poistetaanko käyttäjä?")) return;
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Poistovirhe");

      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 5. Handle trial deletion
  const handleDeleteTrial = async (id) => {
    if (!window.confirm("Poistetaanko käyttäjä kokeilusta?")) return;

    const token = localStorage.getItem("token");
    console.log("🪪 Token for trial delete:", token);
    try {
      const res = await fetch(`/api/admin/trial-bookings/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Poistovirhe");

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

  // 🔹 7. Handle enrollment deletion
  const handleToggleConfirm = async (enrollmentId) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`/api/enrollments/${enrollmentId}/confirm`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Confirmation error");

      // Reloading the list
      await res.json();

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

  // Function to download users PDF with authentication and trigger download
  const downloadUsersPdf = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Kirjaudu sisään ladataksesi PDF:n.");
      return;
    }
    try {
      const response = await fetch("/api/admin/users/pdf", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("PDF lataus epäonnistui");
      }
      const blob = await response.blob();
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

  // Handler for deleting a message
  const handleDeleteMessage = async (id) => {
    if (!window.confirm("Poistetaanko viesti?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/contact/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Poistovirhe");
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Error deleting message:", err);
      alert("Virhe viestin poistossa");
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
              <th>Rooli</th>
              <th>Kurssi</th>
              <th>Toiminnot</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td data-label="Nimi">{u.name}</td>
                <td data-label="Email">{u.email}</td>
                <td data-label="Rooli">
                  <span
                    className={`w3-tag w3-round ${
                      u.role === "admin"
                        ? "w3-red"
                        : u.role === "coach"
                        ? "w3-blue"
                        : "w3-green"
                    }`}
                  >
                    {u.role}
                  </span>
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
                        <div>
                          <strong>Kurssi:</strong> {enr.course.title}
                        </div>
                        <div>
                          <strong>Summa:</strong> €{enr.invoiceAmount}
                        </div>
                        <div>
                          <strong>Lasku:</strong>{" "}
                          <span>
                            {enr.invoiceSent
                              ? "✅ on lähetetty"
                              : "Ei lähetetty"}
                          </span>
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
                        <div className="w3-margin-top">
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            Vahvista maksun vastaanottaminen ={">"}
                            <input
                              type="checkbox"
                              checked={enr.paymentConfirmedByAdmin}
                              onChange={() => handleToggleConfirm(enr.id)}
                              style={{
                                width: "16px",
                                height: "16px",
                                accentColor: enr.paymentConfirmedByAdmin
                                  ? "#4CAF50"
                                  : "#ccc",
                                opacity: enr.paymentConfirmedByAdmin ? 1 : 0.6,
                              }}
                            />
                          </label>
                        </div>
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
                    X Poista
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* trials */}
      <div className="w3-card w3-white w3-padding w3-round-large">
        <h3>KN kokeilijat</h3>
        <table className="w3-table w3-bordered w3-striped w3-small responsive-table">
          <thead className="w3-light-grey">
            <tr>
              <th>Etunimi</th>
              <th>Sukunimi</th>
              <th>Email</th>
              <th>Puhelin</th>
              <th>Rekisteröity pvm</th>
              <th>Toiminnot</th>
            </tr>
          </thead>
          <tbody>
            {trialBookings.map((t) => (
              <tr key={t.id}>
                <td data-label="Etunimi">{t.firstName}</td>
                <td data-label="Sukunimi">{t.lastName}</td>
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
                    Poista
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Saapuneet viestit */}
      <div className="w3-card w3-white w3-padding w3-round-large w3-margin-top">
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
                <td>{m.name}</td>
                <td>{m.email}</td>
                <td>{m.message}</td>
                <td>{new Date(m.createdAt).toLocaleDateString("fi-FI")}</td>
                <td>
                  {m.adminReply || (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const reply = e.target.reply.value;
                        const token = localStorage.getItem("token");
                        await fetch(`/api/admin/contact/${m.id}/reply`, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({ reply }),
                        });
                        fetchMessages(token);
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
                    Poista
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
