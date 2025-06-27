import React, { useState } from "react";

const LoginModal = ({ onClose, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Login failed");
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
        style={{ maxWidth: 400 }}
      >
        <header className="w3-container w3-teal">
          <span onClick={onClose} className="w3-button w3-display-topright">
            &times;
          </span>
          <h3>Login</h3>
        </header>

        <div className="w3-container">
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
              <label>Password</label>
              <input
                className="w3-input w3-border"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </p>
            <p>
              <button type="submit" className="w3-button w3-teal w3-block">
                Login
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
