// AdminLoginModal.jsx
import api from "../../api/api";
import { useState, useEffect, useRef } from "react";

// const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5050/api";

const AdminLoginModal = ({ onClose, onSuccess }) => {
  const [role, setRole] = useState("admin"); // "admin" или "trainer"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    // Close modal on Escape key
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Close modal if clicking outside
  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Basic validation
  const validate = () => {
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Invalid email format");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  // Handle login submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    const endpoint = role === "admin" ? "/admin/login" : "/trainer/login";
    setLoading(true);
    try {
      const { data } = await api.post(endpoint, { email, password });
      const { token, user } = data;

      localStorage.setItem("token", token);
      console.log("Token as a result of login saved:", token);
      setEmail("");
      setPassword("");
      onSuccess({ token, user });
    } catch (err) {
      console.error("❌ Trainer login error:", err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w3-modal"
      style={{ display: "block" }}
      onClick={handleClickOutside}
    >
      <div
        ref={modalRef}
        className="w3-modal-content w3-animate-top w3-card-4"
        style={{ maxWidth: 400 }}
      >
        <header className="w3-container w3-teal">
          <span onClick={onClose} className="w3-button w3-display-topright">
            &times;
          </span>
          <h3>
            Kirjaudu sisään {role === "admin" ? "ylläpitäjänä" : "valmentajana"}
          </h3>
        </header>

        <div className="w3-container">
          <div className="w3-margin-bottom">
            <label className="w3-margin-right w3-large">
              <input
                type="radio"
                name="role"
                value="admin"
                checked={role === "admin"}
                onChange={() => setRole("admin")}
                className="w3-radio"
              />
              Admin
            </label>
            <label className="w3-large">
              <input
                type="radio"
                name="role"
                value="trainer"
                checked={role === "trainer"}
                onChange={() => setRole("trainer")}
                className="w3-radio"
              />
              Trainer
            </label>
          </div>

          {error && (
            <div className="w3-panel w3-red w3-padding-small">{error}</div>
          )}

          <form onSubmit={handleLogin}>
            <p>
              <label>Email</label>
              <input
                className="w3-input w3-border"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </p>
            <p>
              <label>Salasana</label>
              <input
                className="w3-input w3-border"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </p>
            <p>
              <button
                type="submit"
                disabled={loading}
                className="w3-button w3-teal w3-block"
              >
                {loading
                  ? "Odota hetki..."
                  : `Kirjaudu sisään ${
                      role === "admin" ? "ylläpitäjänä" : "valmentajana"
                    }`}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginModal;
