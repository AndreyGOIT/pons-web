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
          method: "GET",
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
        console.log("🚀 Данные пользователя в профиле:", data);
        setUser(data);
        fetchEnrollments(data.id);
      } catch (err) {
        console.error("❌ Ошибка:", err);
        setError("Не удалось загрузить профиль. Авторизуйтесь снова.");
      }
    };

    fetchProfile();
    const fetchEnrollments = async (userId) => {
      try {
        const res = await fetch(`/api/enrollments/mine?userId=${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Ошибка при получении регистраций");

        const data = await res.json();
        console.log("🎓 Курсы пользователя:", data);
        setEnrollments(data);
      } catch (err) {
        console.error("❌ Ошибка загрузки курсов:", err);
      }
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Вы уверены, что хотите удалить аккаунт?");
    if (!confirmed) return;

    try {
      const res = await fetch("/api/users/delete", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Ошибка при удалении аккаунта");

      localStorage.removeItem("token");
      navigate("/register");
    } catch (err) {
      console.error("❌ Ошибка удаления:", err);
      alert("Не удалось удалить аккаунт");
    }
  };

  const roleColor = {
    admin: "bg-red-100 text-red-700 border-red-300",
    coach: "bg-blue-100 text-blue-700 border-blue-300",
    client: "bg-green-100 text-green-700 border-green-300",
  };

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (!user) {
    return <div className="p-4">Загрузка...</div>;
  }

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user.name
  )}&background=random&size=128`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-200 p-8 text-center">
        <img
          src={avatarUrl}
          alt="Аватар"
          className="w-24 h-24 rounded-full mx-auto mb-4 shadow"
        />
        <h1 className="text-2xl font-bold mb-1">{user.name}</h1>
        <p className="text-gray-600">{user.email}</p>

        <span
          className={`inline-block mt-3 px-3 py-1 text-sm font-semibold border rounded-full ${
            roleColor[user.role] || "bg-gray-100 text-gray-700 border-gray-300"
          }`}
        >
          {user.role}
        </span>

        {user.createdAt && (
          <p className="text-sm text-gray-500 mt-2">
            Зарегистрирован:{" "}
            {new Date(user.createdAt).toLocaleDateString("ru-RU")}
          </p>
        )}
        {/*render enrollments*/}
        <div className="mt-8 text-left">
          <h2 className="text-xl font-semibold mb-2">Мои курсы</h2>
          {enrollments.length > 0 ? (
            <ul className="space-y-4">
              {enrollments.map((enrollment) => (
                <li
                  key={enrollment.id}
                  className="border rounded-xl p-4 shadow-sm bg-gray-50"
                >
                  <h3 className="text-lg font-semibold text-gray-800">
                    {enrollment.course?.title || "Без названия"}
                  </h3>

                  <p className="text-sm text-gray-600 mt-1">
                    Дата регистрации:{" "}
                    <span className="font-medium">
                      {new Date(enrollment.invoiceSentDate).toLocaleDateString(
                        "ru-RU"
                      )}
                    </span>
                  </p>

                  <p className="text-sm mt-1">
                    Статус счета:{" "}
                    <span
                      className={`font-medium ${
                        enrollment.invoicePaid
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {enrollment.invoicePaid ? "Оплачен" : "Не оплачен"}
                    </span>
                  </p>

                  <p className="text-sm mt-1">
                    Подтверждение админом:{" "}
                    <span
                      className={`font-medium ${
                        enrollment.paymentConfirmedByAdmin
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      {enrollment.paymentConfirmedByAdmin
                        ? "Подтверждено"
                        : "Ожидает подтверждения"}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">
              Вы ещё не зарегистрированы ни на один курс.
            </p>
          )}
        </div>
        {/*render buttons*/}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleLogout}
            className="w-full bg-gray-800 text-white py-2 rounded-xl hover:bg-gray-900 transition"
          >
            Выйти
          </button>
          <button
            onClick={handleDelete}
            className="w-full border border-red-500 text-red-600 py-2 rounded-xl hover:bg-red-50 transition"
          >
            Удалить аккаунт
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
