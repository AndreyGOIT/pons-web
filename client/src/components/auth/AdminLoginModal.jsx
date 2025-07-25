import React, { useState, useEffect, useRef } from "react";

const AdminLoginModal = ({ onClose, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      const { token, user } = data;
      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", token);
      console.log(
        "Token as a result of login saved:",
        localStorage.getItem("token")
      );
      setEmail("");
      setPassword("");
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
        style={{ maxWidth: 400 }}
      >
        <header className="w3-container w3-teal">
          <span onClick={onClose} className="w3-button w3-display-topright">
            &times;
          </span>
          <h3>Login as admin</h3>
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
              <button
                type="submit"
                disabled={loading}
                className="w3-button w3-teal w3-block"
              >
                {loading ? "Please wait..." : "Login"}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginModal;
