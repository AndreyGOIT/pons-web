import React, { useState } from "react";

const RegisterModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Registration failed");
        return;
      }

      const { token } = await res.json();
      localStorage.setItem("token", token);
      onSuccess();
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    }
  };

  return (
    <div className="w3-modal" style={{ display: "block" }}>
      <div
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
              <label>Name</label>
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
              <label>Password</label>
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
              <label>Confirm Password</label>
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
              <button type="submit" className="w3-button w3-teal w3-block">
                Register
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
