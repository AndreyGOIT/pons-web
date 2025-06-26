import React, { useState } from "react";

const NavigationBar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openNav = () => setSidebarOpen(true);
  const closeNav = () => setSidebarOpen(false);

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
        <a href="#" className="w3-bar-item w3-button">
          Link 1
        </a>
        <a href="#" className="w3-bar-item w3-button">
          Link 2
        </a>
        <a href="#" className="w3-bar-item w3-button">
          Link 3
        </a>
        <a href="#" className="w3-bar-item w3-button">
          Link 4
        </a>
        <a href="#" className="w3-bar-item w3-button">
          Link 5
        </a>
      </nav>

      {/* Navbar */}
      <div className="w3-top">
        <div className="w3-bar w3-theme-d2 w3-left-align">
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
          <div className="w3-dropdown-hover w3-hide-small">
            <button className="w3-button" title="Notifications">
              Dropdown <i className="fa fa-caret-down"></i>
            </button>
            <div className="w3-dropdown-content w3-card-4 w3-bar-block">
              <a href="#" className="w3-bar-item w3-button">
                Link
              </a>
              <a href="#" className="w3-bar-item w3-button">
                Link
              </a>
              <a href="#" className="w3-bar-item w3-button">
                Link
              </a>
            </div>
          </div>
          <a
            href="#"
            className="w3-bar-item w3-button w3-hide-small w3-right w3-hover-teal"
            title="Search"
          >
            <i className="fa fa-search"></i>
          </a>
        </div>
      </div>
    </>
  );
};

export default NavigationBar;
