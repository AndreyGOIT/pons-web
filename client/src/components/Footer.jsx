import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import AdminLoginModal from "./auth/AdminLoginModal";

const Footer = () => {
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  return (
    <div>
      <footer className="w3-container w3-padding-32 w3-theme-d1 w3-center">
        <h4>Seuraa meitä / Follow us</h4>

        <div className="w3-margin-bottom">
          <a
            className="w3-button w3-large w3-theme-d3 w3-hover-opacity"
            href="https://www.facebook.com/porvoonnyrkkeilyseura"
            target="_blank"
            rel="noopener noreferrer"
            title="Facebook"
          >
            <i className="fab fa-facebook-f"></i>
          </a>
          <a
            className="w3-button w3-large w3-theme-d3 w3-hover-opacity"
            href="#"
            title="Instagram (soon)"
          >
            <i className="fab fa-instagram"></i>
          </a>
          {/* Добавь другие соцсети, если нужно */}
        </div>

        {/* <p className="w3-small">
          &copy; {new Date().getFullYear()} Porvoon Nyrkkeilyseura ry
        </p>
        <p className="w3-small">
          Powered by{" "}
          <a
            href="https://www.w3schools.com/w3css/default.asp"
            target="_blank"
            rel="noopener noreferrer"
          >
            W3.CSS
          </a>
        </p> */}

        <button
          className="w3-button w3-small w3-theme-l3 w3-hover-theme w3-margin-top w3-hide-small"
          onClick={() => setShowAdminLoginModal(true)}
        >
          Admin Login
        </button>
      </footer>

      {showAdminLoginModal && (
        <AdminLoginModal
          onClose={() => setShowAdminLoginModal(false)}
          onSuccess={({ token, user }) => {
            login(token, user);
            setShowAdminLoginModal(false);
            setTimeout(() => {
              navigate("/adminpanel");
            }, 0);
          }}
        />
      )}
    </div>
  );
};

export default Footer;
