import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import AdminLoginModal from "./auth/AdminLoginModal";
import { Link } from "react-router-dom";

const Footer = () => {
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  return (
    <div>
      <footer className="w3-theme-d1 w3-padding-16 w3-center">
        {/* Upper section */}
        <div className="w3-container w3-margin-bottom">
          <h4>Porvoon Nyrkkeilyseura ry</h4>
          <p>Perustettu 1992 – Yhdessä kohti voittoja!</p>
          <div>
            <a
              href="https://www.facebook.com/porvoonnyrkkeilyseura"
              className="w3-button w3-theme-d3 w3-hover-opacity w3-margin-right"
            >
              <i className="fab fa-facebook-f"></i>
            </a>
            <a
              href="https://www.instagram.com/pons_nyrkkeily/"
              className="w3-button w3-theme-d3 w3-hover-opacity"
            >
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>

        {/* Central part */}
        <div
          className="w3-row-padding w3-margin-top"
          style={{ padding: "0 16px" }}
        >
          {/* Tietoa seurasta */}
          <div className="w3-third w3-left-align w3-padding">
            <h5>Tietoa seurasta</h5>
            <p>
              Vuonna 1992 perustettu seura on kasvattanut monia mestareita, mm.
              Robert Helenius ja Arslan Khataev.
            </p>
            <p>
              Vuonna 2024 seura keskittyy nuorten harrastusnyrkkeilyyn ja
              kilpanyrkkeilyyn.
            </p>
          </div>

          {/* Logo */}
          <div className="w3-third w3-center w3-padding-top">
            <img src="/images/pons_logo.jpg" alt="PONS logo" width="150" />
          </div>

          {/* Yhteystiedot */}
          <div className="w3-third w3-left-align w3-padding">
            <h5>Yhteystiedot</h5>
            <p>📧 pons@pons.fi</p>
            <p>📍 Kirkkokatu 1, 06100 Porvoo</p>
            <p>💳 FI78 4055 0012 3222 24</p>
          </div>
        </div>

        {/* Bottom section */}
        <div className="w3-margin-top">
          <p className="w3-small">
            © {new Date().getFullYear()} Porvoon Nyrkkeilyseura PONS
          </p>
          <button
            className="w3-button w3-small w3-theme-l3 w3-hover-theme"
            onClick={() => setShowAdminLoginModal(true)}
          >
            Admin Login
          </button>
        </div>
      </footer>
      {/* <footer className="w3-container w3-padding-32 w3-theme-d1 w3-center">
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
            href="https://www.instagram.com/pons_nyrkkeily/"
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram"
          >
            <i className="fab fa-instagram"></i>
          </a>
        </div>

        <div>
          <Link
            to="/"
            className="w3-bar-item w3-button "
            style={{ marginLeft: "10px", padding: "5px" }}
          >
            <img src="/images/pons_logo.jpg" alt="pons_logo" width="100px" />
          </Link>
        </div>

        <p>(c) Porvoon Nyrkkelyseura PONS, 2025</p>
        <button
          className="w3-button w3-small w3-theme-l3 w3-hover-theme w3-hide-small"
          onClick={() => setShowAdminLoginModal(true)}
        >
          Admin Login
        </button>
      </footer> */}

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
