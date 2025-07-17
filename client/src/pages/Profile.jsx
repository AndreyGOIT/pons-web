import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/users/me", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!res.ok)
          throw new Error("Ошибка при получении данных пользователя");

        const data = await res.json();
        setUser(data);
        fetchEnrollments(data.id);
      } catch (err) {
        console.error("Ошибка загрузки профиля:", err);
        setError("Не удалось загрузить профиль. Авторизуйтесь снова.");
      }
    };

    const fetchEnrollments = async (userId) => {
      try {
        const res = await fetch(`/api/enrollments/mine?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Ошибка при получении регистраций");

        const data = await res.json();
        console.log("Регистрации пользователя:", data);
        setEnrollments(data);
      } catch (err) {
        console.error("Ошибка при получении регистраций:", err);
        setError("Не удалось загрузить регистрации.");
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleMarkAsPaid = async (enrollmentId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/enrollments/${enrollmentId}/mark-paid`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Ошибка при отметке оплаты");

      setEnrollments((prev) =>
        prev.map((e) =>
          e.id === enrollmentId ? { ...e, invoicePaid: true } : e
        )
      );
    } catch (err) {
      console.error("Ошибка при отметке оплаты:", err);
    }
  };

  const handleCancelEnrollment = async (id) => {
    if (!window.confirm("Вы уверены, что хотите отменить регистрацию?")) return;

    try {
      const token = localStorage.getItem("token"); // или sessionStorage, если ты его туда сохраняешь
      const res = await fetch(`/api/enrollments/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Ошибка при удалении регистрации");

      setEnrollments((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Ошибка при удалении:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleDelete = async () => {
    if (!window.confirm("Удалить аккаунт?")) return;

    try {
      const res = await fetch("/api/users/delete", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!res.ok) throw new Error("Ошибка при удалении аккаунта");

      localStorage.removeItem("token");
      navigate("/register");
    } catch (err) {
      console.error("Ошибка при удалении:", err);
      alert("Не удалось удалить аккаунт.");
    }
  };

  const roleColorClass = {
    admin: "w3-pale-red w3-text-red w3-border-red",
    coach: "w3-pale-blue w3-text-blue w3-border-blue",
    client: "w3-pale-green w3-text-green w3-border-green",
  };

  if (error)
    return (
      <div className="w3-panel w3-red w3-padding">
        <p>{error}</p>
      </div>
    );

  if (!user)
    return (
      <div className="w3-container w3-center w3-padding-24">
        <p>Загрузка...</p>
      </div>
    );

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user.name
  )}&background=random&size=128`;

  return (
    <div
      className="w3-container w3-light-gray w3-padding-24"
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        className="w3-card-4 w3-white w3-round-large w3-padding-large"
        style={{ maxWidth: "480px", width: "100%" }}
      >
        {/* Header with Avatar and Name */}
        <div className="w3-center">
          <img
            src={avatarUrl}
            alt="Аватар"
            className="w3-circle"
            style={{ width: "96px", height: "96px", boxShadow: "0 0 8px #ccc" }}
          />
          <h2 className="w3-margin-top">{user.name}</h2>
          <p className="w3-text-grey">{user.email}</p>
          <span
            className={`w3-tag w3-border ${
              roleColorClass[user.role] ||
              "w3-light-grey w3-text-dark-grey w3-border-gray"
            }`}
            style={{
              fontWeight: "600",
              fontSize: "14px",
              padding: "6px 12px",
              borderRadius: "16px",
            }}
          >
            {user.role}
          </span>
          {user.createdAt && (
            <p className="w3-text-grey w3-small w3-margin-top">
              Зарегистрирован:{" "}
              {new Date(user.createdAt).toLocaleDateString("ru-RU")}
            </p>
          )}
        </div>

        {/* Курсы */}
        <div className="w3-section">
          <h3>Мои курсы</h3>
          {enrollments.length > 0 ? (
            <ul className="w3-ul w3-card-2">
              {enrollments.map((e) => (
                <li key={e.id} className="w3-padding-16">
                  <header className="w3-container-fluid w3-padding w3-light-grey">
                    <strong>{e.course?.title || "Без названия"}</strong>
                  </header>
                  <div className="w3-small w3-margin-top">
                    <div className="w3-margin-bottom">
                      <p>
                        <input
                          type="checkbox"
                          checked={!!e.invoiceSent}
                          readOnly
                          // disabled
                        />{" "}
                        <label className="w3-margin-right">
                          Счёт выставлен
                        </label>
                      </p>
                    </div>
                    <div className="w3-card w3-white w3-round-large w3-padding-16 w3-margin-top">
                      <h4 className="w3-center w3-text-dark-gray">
                        🧾 Данные для оплаты регистрации
                      </h4>
                      <table className="w3-table w3-bordered w3-striped w3-hoverable w3-small w3-margin-top">
                        <tbody>
                          {e.invoiceSentDate && (
                            <tr>
                              <td>📅 Дата счёта</td>
                              <td>
                                {new Date(e.invoiceSentDate).toLocaleDateString(
                                  "ru-RU"
                                )}
                              </td>
                            </tr>
                          )}
                          {e.invoiceAmount > 0 && (
                            <tr>
                              <td>💰 Сумма</td>
                              <td className="w3-text-green w3-large">
                                {e.invoiceAmount} €
                              </td>
                            </tr>
                          )}
                          {e.paymentIban && (
                            <tr>
                              <td>🏦 IBAN</td>
                              <td>
                                <strong>{e.paymentIban}</strong>
                              </td>
                            </tr>
                          )}
                          {e.paymentReference && (
                            <tr>
                              <td>📌 Назначение платежа</td>
                              <td>{e.paymentReference}</td>
                            </tr>
                          )}
                          {e.invoiceDueDate && (
                            <tr>
                              <td>⏳ Крайний срок</td>
                              <td>
                                {new Date(e.invoiceDueDate).toLocaleDateString(
                                  "ru-RU"
                                )}
                              </td>
                            </tr>
                          )}
                          {e.userPaymentMarkedAt && (
                            <tr className="w3-pale-yellow">
                              <td>🕒 Отмечено как оплачено</td>
                              <td>
                                {new Date(
                                  e.userPaymentMarkedAt
                                ).toLocaleDateString("ru-RU")}
                              </td>
                            </tr>
                          )}
                          {e.adminConfirmedAt && (
                            <tr className="w3-pale-green">
                              <td>✅ Подтверждено админом</td>
                              <td>
                                {new Date(
                                  e.adminConfirmedAt
                                ).toLocaleDateString("ru-RU")}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="w3-small w3-margin-top">
                      <div className="w3-margin-bottom">
                        <label className="w3-margin-right">
                          <input
                            type="checkbox"
                            checked={!!e.invoicePaid}
                            onChange={() => handleMarkAsPaid(e.id)}
                          />{" "}
                          Оплачено пользователем
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={!!e.paymentConfirmedByAdmin}
                            disabled
                          />{" "}
                          Подтверждено админом
                        </label>
                      </div>
                    </div>
                  </div>
                  <footer className="w3-container-fluid w3-padding w3-dark-grey w3-margin-top">
                    <button
                      onClick={() => handleCancelEnrollment(e.id)}
                      className="w3-button w3-small w3-red w3-hover-pale-red"
                      style={{ padding: "4px 12px" }}
                    >
                      Отменить регистрацию
                    </button>
                  </footer>
                </li>
              ))}
            </ul>
          ) : (
            <p className="w3-text-grey">
              Вы ещё не зарегистрированы ни на один курс.
            </p>
          )}
        </div>

        {/* Кнопки */}
        <div className="w3-margin-top">
          <button
            onClick={handleLogout}
            className="w3-button w3-block w3-dark-gray w3-hover-black w3-round-large"
          >
            Выйти
          </button>
          <button
            onClick={handleDelete}
            className="w3-button w3-block w3-white w3-border w3-border-red w3-text-red w3-hover-pale-red w3-round-large w3-margin-top"
          >
            Удалить аккаунт
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
