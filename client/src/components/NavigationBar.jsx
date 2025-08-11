import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import LoginModal from "./auth/LoginModal";
import RegisterModal from "./auth/RegisterModal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth"; // <-- import hook from context

const NavigationBar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const navigate = useNavigate();
  const { user, login, logout } = useAuth(); // <-- we get it from the context

  const openNav = () => setSidebarOpen(true);
  const closeNav = () => setSidebarOpen(false);
  const goToProfile = () => navigate("/profile");

  useEffect(() => {
    window.openLoginModal = () => setShowLoginModal(true);
    window.openRegisterModal = () => setShowRegisterModal(true);

    const pendingCourseId = sessionStorage.getItem("pendingCourseId");
    if (pendingCourseId) {
      sessionStorage.removeItem("pendingCourseId");
      navigate("/profile");
    }
    // Scroll to section if redirected to "/" with a sectionId in sessionStorage
    if (window.location.pathname === "/") {
      const pendingSectionId = sessionStorage.getItem("pendingSectionId");
      if (pendingSectionId) {
        sessionStorage.removeItem("pendingSectionId");
        setTimeout(() => {
          document
            .getElementById(pendingSectionId)
            ?.scrollIntoView({ behavior: "smooth" });
        }, 100); // wait for DOM to render
      }
    }
  }, [navigate]);

  const goToSection = (sectionId) => {
    if (window.location.pathname !== "/") {
      sessionStorage.setItem("pendingSectionId", sectionId);
      navigate("/");
    } else {
      document
        .getElementById(sectionId)
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Sidebar */}
      <nav
        className="w3-sidebar w3-bar-block w3-white w3-card w3-animate-left w3-xlarge"
        style={{ display: sidebarOpen ? "block" : "none", zIndex: 2 }}
        id="mySidebar"
      >
        <button
          className="w3-bar-item w3-button w3-display-topright w3-text-teal"
          onClick={closeNav}
        >
          Close <i className="fa fa-remove"></i>
        </button>
        <button
          className="w3-bar-item w3-button"
          onClick={() => {
            goToSection("team");
            closeNav();
          }}
        >
          Tiimi
        </button>
        <button
          className="w3-bar-item w3-button"
          onClick={() => {
            goToSection("koulutuskurssit");
            closeNav();
          }}
        >
          Koulutuskurssit
        </button>
        <button
          className="w3-bar-item w3-button"
          onClick={() => {
            goToSection("pricing");
            closeNav();
          }}
        >
          Hinnasto
        </button>
        <button
          className="w3-bar-item w3-button"
          onClick={() => {
            goToSection("contact");
            closeNav();
          }}
        >
          Yhteystiedot
        </button>

        {!user ? (
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
              Profiili
            </button>
            <button
              className="w3-bar-item w3-button"
              onClick={() => {
                logout();
                closeNav();
                navigate("/");
              }}
            >
              Logout
            </button>
          </>
        )}
      </nav>

      {/* Top Navbar */}
      <div className="w3-bar w3-theme-d2 w3-left-align">
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            width: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <button
            className="w3-bar-item w3-button w3-hide-medium w3-hide-large w3-right w3-hover-white w3-theme-d2"
            onClick={openNav}
          >
            <i className="fa fa-bars"></i>
          </button>

          <Link
            to="/"
            className="w3-bar-item w3-button "
            style={{ marginLeft: "10px", padding: "5px" }}
          >
            <img src="/images/pons_logo.jpg" alt="pons_logo" width="50px" />
          </Link>

          <button
            className="w3-bar-item w3-button"
            onClick={() => goToSection("team")}
          >
            Tiimi
          </button>
          <button
            className="w3-bar-item w3-button"
            onClick={() => goToSection("koulutuskurssit")}
          >
            Koulutuskurssit
          </button>
          <button
            className="w3-bar-item w3-button"
            onClick={() => goToSection("pricing")}
          >
            Hinnasto
          </button>
          <button
            className="w3-bar-item w3-button"
            onClick={() => goToSection("contact")}
          >
            Yhteystiedot
          </button>

          {/* block of code for login and register */}
          <div
            className="w3-bar-item w3-hide-small"
            style={{ marginLeft: "auto" }}
          >
            {user ? (
              <div>
                <span>Tervetuloa, {user.name}!</span>
                <button
                  onClick={() => {
                    navigate("/profile");
                  }}
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => setShowLoginModal(true)}>Login</button>
                <button
                  onClick={() => setShowRegisterModal(true)}
                  style={{ marginLeft: 3 }}
                >
                  Register
                </button>
              </>
            )}
            {/* end of block of code for login and register */}
          </div>
        </div>
      </div>

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={({ token, user }) => {
            login(token, user);
            setShowLoginModal(false);
            const pendingCourseId = sessionStorage.getItem("pendingCourseId");
            if (pendingCourseId) {
              sessionStorage.removeItem("pendingCourseId");
              navigate("/profile");
            } else {
              navigate("/profile");
            }
          }}
        />
      )}

      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onSuccess={({ token, user }) => {
            login(token, user);
            setShowRegisterModal(false);
            const pendingCourseId = sessionStorage.getItem("pendingCourseId");
            if (pendingCourseId) {
              sessionStorage.removeItem("pendingCourseId");
              navigate("/profile");
            } else {
              navigate("/profile");
            }
          }}
        />
      )}
    </>
  );
};

export default NavigationBar;
