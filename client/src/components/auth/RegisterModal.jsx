// RegisterModal.jsx
import React, { useState, useEffect, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5050/api";

const RegisterModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validate = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Invalid email format");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "client",
        }),
      });

      const data = await res.json();
      const { token, user } = data;
      if (!res.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      onSuccess({ token, user });
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
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
        style={{ maxWidth: 450 }}
      >
        <header className="w3-container w3-teal">
          <span onClick={onClose} className="w3-button w3-display-topright">
            &times;
          </span>
          <h3>Register</h3>
        </header>

        <div className="w3-container">
          {error && (
            <div className="w3-panel w3-red w3-padding-small">{error}</div>
          )}

          <form onSubmit={handleRegister}>
            <p>
              <label>Nimi</label>
              <input
                className="w3-input w3-border"
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </p>
            <p>
              <label>Email</label>
              <input
                className="w3-input w3-border"
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </p>
            <p>
              <label>Salasana</label>
              <input
                className="w3-input w3-border"
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </p>
            <p>
              <label>Vahvista salasana</label>
              <input
                className="w3-input w3-border"
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </p>
            <p>
              <button
                type="submit"
                disabled={loading}
                className="w3-button w3-teal w3-block"
              >
                {loading ? "Odota hetki..." : "Rekisteröidy"}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
