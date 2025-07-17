import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  // const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchAdminData = async () => {
      try {
        const res = await fetch("/api/users/me", {
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
        // fetchCourses(token);
      } catch (err) {
        console.error(err);
        setError("Ошибка при загрузке данных администратора.");
      }
    };

    const fetchUsers = async (token) => {
      try {
        const res = await fetch("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Ошибка получения списка пользователей");

        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
      }
    };

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

    // const fetchCourses = async (token) => {
    //   try {
    //     const res = await fetch("/api/courses", {
    //       headers: { Authorization: `Bearer ${token}` },
    //     });
    //     if (!res.ok) throw new Error("Ошибка получения курсов");

    //     const data = await res.json();
    //     setCourses(data);
    //   } catch (err) {
    //     console.error(err);
    //   }
    // };

    fetchAdminData();
  }, [navigate]);

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Удалить пользователя?")) return;
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Ошибка удаления");

      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const getUserEnrollments = (userId) =>
    enrollments.filter((e) => e.user.id === userId);

  const handleToggleConfirm = async (enrollmentId) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`/api/enrollments/${enrollmentId}/confirm`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Ошибка подтверждения");

      // Перезагрузка списка
      await res.json();
      // const updated = await res.json();
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
      alert("Не удалось подтвердить оплату.");
    }
  };

  if (error)
    return (
      <div className="w3-panel w3-red w3-padding">
        <p>{error}</p>
      </div>
    );

  if (!admin)
    return (
      <div className="w3-container w3-center w3-padding-32">
        <p>Загрузка...</p>
      </div>
    );

  return (
    <div
      className="w3-container w3-light-grey w3-padding-32"
      style={{ minHeight: "100vh" }}
    >
      <div className="w3-card w3-white w3-padding w3-round-large w3-margin-bottom">
        <h2 className="w3-center">Панель администратора</h2>
        <p className="w3-center w3-text-grey">
          {admin.name} ({admin.email}) | Роль:{" "}
          <span className="w3-tag w3-red w3-round">Admin</span>
        </p>
      </div>

      {/* Пользователи */}
      <div className="w3-card w3-white w3-padding w3-round-large w3-margin-bottom">
        <h3>Пользователи</h3>
        <table className="w3-table w3-bordered w3-striped w3-small">
          <thead className="w3-light-grey">
            <tr>
              <th>Nimi</th>
              <th>Email</th>
              <th>Roli</th>
              <th>Kurssi</th>
              <th>Toiminnot</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
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
                <td>
                  {getUserEnrollments(u.id).length === 0 ? (
                    <em>Нет регистраций</em>
                  ) : (
                    getUserEnrollments(u.id).map((enr) => (
                      <div
                        key={enr.id}
                        className="w3-padding-small w3-border w3-round-small w3-margin-bottom"
                      >
                        <div>
                          <strong>Курс:</strong> {enr.course.title}
                        </div>
                        <div>
                          <strong>Сумма:</strong> €{enr.invoiceAmount}
                        </div>
                        <div>
                          <strong>Счет:</strong>{" "}
                          <span
                            className={`w3-tag w3-round ${
                              enr.invoiceSent ? "w3-blue" : "w3-red"
                            }`}
                          >
                            {enr.invoiceSent ? "Выслан" : "Не выслан"}
                          </span>
                        </div>
                        <div>
                          <strong>Оплата:</strong>{" "}
                          <span
                            className={`w3-tag w3-round ${
                              enr.invoicePaid ? "w3-green" : "w3-yellow"
                            }`}
                          >
                            {enr.invoicePaid ? "Оплачено" : "Ожидает оплаты"}
                          </span>
                        </div>
                        <div>
                          <strong>Подтверждение админом:</strong>{" "}
                          <span
                            className={`w3-tag w3-round ${
                              enr.paymentConfirmedByAdmin
                                ? "w3-purple"
                                : "w3-orange"
                            }`}
                          >
                            {enr.paymentConfirmedByAdmin
                              ? "Подтверждено"
                              : "Не подтверждено"}
                          </span>
                        </div>
                        <div className="w3-margin-top">
                          <label>
                            <input
                              className="w3-check"
                              type="checkbox"
                              checked={enr.paymentConfirmedByAdmin}
                              onChange={() => handleToggleConfirm(enr.id)}
                            />{" "}
                            Подтвердить оплату
                          </label>
                        </div>
                      </div>
                      // <div
                      //   key={enr.id}
                      //   className="w3-padding-small w3-border w3-round-small w3-margin-bottom"
                      // >
                      //   <div>
                      //     <strong>Курс:</strong> {enr.course.title}
                      //   </div>
                      //   <div>
                      //     <strong>Сумма:</strong> €{enr.invoiceAmount}
                      //   </div>
                      //   <div>
                      //     <label>
                      //       <input
                      //         type="checkbox"
                      //         checked={enr.paymentConfirmedByAdmin}
                      //         onChange={() => handleToggleConfirm(enr.id)}
                      //       />{" "}
                      //       Подтверждено
                      //     </label>
                      //   </div>
                      // </div>
                    ))
                  )}
                </td>
                <td>
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

      {/* Курсы */}
      {/* <div className="w3-card w3-white w3-padding w3-round-large">
        <h3>Курсы</h3>
        <table className="w3-table w3-bordered w3-striped w3-small">
          <thead className="w3-light-grey">
            <tr>
              <th>Название</th>
              <th>Описание</th>
              <th>Дата начала</th>
              <th>Цена</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id}>
                <td>{c.title}</td>
                <td>{c.description}</td>
                <td>{new Date(c.startDate).toLocaleDateString("ru-RU")}</td>
                <td>{c.price} €</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={() =>
            window.open("/api/admin/summary/courses/pdf", "_blank")
          }
        >
          Скачать отчёт по курсам
        </button>
      </div> */}
    </div>
  );
}

export default AdminDashboard;
