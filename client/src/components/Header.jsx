import React, { useState } from "react";

const Header = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      {/* Hero image */}
      <div className="w3-display-container w3-animate-opacity">
        <img
          src="/images/pons_nyrkkeilysali_2025.jpg"
          alt="nyrkkeilysali"
          style={{ width: "100%", minHeight: "350px", maxHeight: "600px" }}
        />
        <div className="w3-container w3-display-bottomleft w3-margin-bottom">
          <button
            onClick={() => setModalOpen(true)}
            className="w3-button w3-xlarge w3-theme w3-hover-teal"
            title="Go To W3.CSS"
          >
            LEARN W3.CSS
          </button>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="w3-modal" style={{ display: "block" }}>
          <div className="w3-modal-content w3-card-4 w3-animate-top">
            <header className="w3-container w3-teal w3-display-container">
              <span
                onClick={() => setModalOpen(false)}
                className="w3-button w3-teal w3-display-topright"
              >
                <i className="fa fa-remove"></i>
              </span>
              <h4>Oh snap! We just showed you a modal..</h4>
              <h5>
                Because we can <i className="fa fa-smile-o"></i>
              </h5>
            </header>
            <div className="w3-container">
              <p>Cool huh? Ok, enough teasing around..</p>
              <p>
                Go to our{" "}
                <a className="w3-text-teal" href="/w3css/default.asp">
                  W3.CSS Tutorial
                </a>{" "}
                to learn more!
              </p>
            </div>
            <footer className="w3-container w3-teal">
              <p>Modal footer</p>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
