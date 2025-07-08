import React, { useState } from "react";
import LoginModal from "./auth/LoginModal";
import RegisterModal from "./auth/RegisterModal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth"; // <-- импортируем хук из контекста

const NavigationBar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, login, logout } = useAuth(); // <-- получаем из контекста

  const openNav = () => setSidebarOpen(true);
  const closeNav = () => setSidebarOpen(false);
  const goToProfile = () => navigate("/profile");

  return (
    <>
      {/* Sidebar */}
      <nav
        className="w3-sidebar w3-bar-block w3-white w3-card w3-animate-left w3-xxlarge"
        style={{ display: sidebarOpen ? "block" : "none", zIndex: 2 }}
        id="mySidebar"
      >
        <button
          className="w3-bar-item w3-button w3-display-topright w3-text-teal"
          onClick={closeNav}
        >
          Close <i className="fa fa-remove"></i>
        </button>
        <a href="#team" className="w3-bar-item w3-button">
          Team
        </a>
        <a href="#work" className="w3-bar-item w3-button">
          Work
        </a>
        <a href="#pricing" className="w3-bar-item w3-button">
          Price
        </a>
        <a href="#contact" className="w3-bar-item w3-button">
          Contact
        </a>

        {!isAuthenticated ? (
          <>
            <button
              className="w3-bar-item w3-button"
              onClick={() => setShowLoginModal(true)}
            >
              Login
            </button>
            <button
              className="w3-bar-item w3-button"
              onClick={() => setShowRegisterModal(true)}
            >
              Register
            </button>
          </>
        ) : (
          <>
            <button className="w3-bar-item w3-button" onClick={goToProfile}>
              Profile
            </button>
            <button
              className="w3-bar-item w3-button"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Logout
            </button>
          </>
        )}
      </nav>

      {/* Top Navbar */}

      <div className="w3-top">
        <div
          className="w3-bar w3-theme-d2 w3-left-align w3-content"
          style={{ maxWidth: "1440px" }}
        >
          <button
            className="w3-bar-item w3-button w3-hide-medium w3-hide-large w3-right w3-hover-white w3-theme-d2"
            onClick={openNav}
          >
            <i className="fa fa-bars"></i>
          </button>
          <a href="#" className="w3-bar-item w3-button w3-teal">
            <i className="fa fa-home w3-margin-right"></i>Logo
          </a>
          <a
            href="#team"
            className="w3-bar-item w3-button w3-hide-small w3-hover-white"
          >
            Team
          </a>
          <a
            href="#work"
            className="w3-bar-item w3-button w3-hide-small w3-hover-white"
          >
            Work
          </a>
          <a
            href="#pricing"
            className="w3-bar-item w3-button w3-hide-small w3-hover-white"
          >
            Price
          </a>
          <a
            href="#contact"
            className="w3-bar-item w3-button w3-hide-small w3-hover-white"
          >
            Contact
          </a>

          <div className="w3-bar-item w3-right w3-hide-small">
            {!isAuthenticated ? (
              <>
                <button
                  className="w3-button w3-hover-white"
                  onClick={() => setShowLoginModal(true)}
                >
                  Login
                </button>
                <button
                  className="w3-button w3-hover-white"
                  onClick={() => setShowRegisterModal(true)}
                >
                  Register
                </button>
              </>
            ) : (
              <>
                <button
                  className="w3-button w3-hover-white"
                  onClick={goToProfile}
                >
                  Profile
                </button>
                <button
                  className="w3-button w3-hover-white"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={(token) => {
            login(token); // <-- вызываем login из контекста
            setShowLoginModal(false);
            setTimeout(() => {
              navigate("/profile");
            }, 0);
          }}
        />
      )}

      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onSuccess={(token) => {
            login(token); // <-- вызываем login из контекста
            setShowRegisterModal(false);
            navigate("/profile");
          }}
        />
      )}
    </>
  );
};

export default NavigationBar;
