// RegisterModal.jsx
import React, { useState, useEffect, useRef } from "react";
import api from "../../api/api";

const RegisterModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
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
      const { data } = await api.post("/users/register", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: "client",
      });

      const { token, user } = data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      onSuccess({ token, user });
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong");
      }
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
              <label>Etunimi</label>
              <input
                className="w3-input w3-border"
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
              />
            </p>
            <p>
              <label>Sukunimi</label>
              <input
                className="w3-input w3-border"
                type="text"
                name="lastName"
                required
                value={formData.lastName}
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
