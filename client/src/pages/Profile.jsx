import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const decodedPayload = JSON.parse(window.atob(base64));
      setUserData(decodedPayload);
    } catch (error) {
      console.error("Invalid token", error);
      localStorage.removeItem("token");
      navigate("/");
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const deleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/users/me", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("Account deleted.");
        localStorage.removeItem("token");
        navigate("/");
      } else {
        alert("Failed to delete account.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error deleting account.");
    }
  };

  if (!userData) return null;

  return (
    <div
      className="w3-container w3-content"
      style={{ maxWidth: "600px", marginTop: "80px" }}
    >
      <h2 className="w3-center">
        Welcome, {userData.username || userData.email}!
      </h2>

      <div className="w3-card w3-padding w3-margin-top">
        <p>
          <strong>Email:</strong> {userData.email}
        </p>
        <p>
          <strong>Username:</strong> {userData.username || "N/A"}
        </p>
        <p>
          <strong>Registered:</strong>{" "}
          {new Date(userData.iat * 1000).toLocaleString()}
        </p>
      </div>

      <div className="w3-center w3-margin-top">
        <button className="w3-button w3-teal w3-margin-right" onClick={logout}>
          Logout
        </button>
        <button className="w3-button w3-red" onClick={deleteAccount}>
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default Profile;
