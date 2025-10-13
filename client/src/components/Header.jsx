import React, { useState } from "react";
import api from "../api/api";

const Header = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Simple Field Check
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError("Täytä pakolliset kentät.");
      return;
    }

    try {
      await api.post("/trial-bookings", formData);

      setSubmitted(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      });
    } catch (err) {
      console.error(err);
      setError("Virhe yhdistettäessä palvelimeen. Yritä myöhemmin uudelleen.");
    }
  };

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
            onClick={() => {
              setModalOpen(true);
              setSubmitted(false); // nollaa uudelleenavaamisen yhteydessä
            }}
            className="w3-button w3-xlarge w3-theme w3-hover-teal pulse-button"
            title="KOKEILE ILMAISEKSI"
          >
            KOKEILE ILMAISEKSI
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
              <h4>Ilmoittautuminen kokeilutunnille</h4>
            </header>

            <div className="w3-container w3-padding">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="w3-container">
                  <label>Etunimi *</label>
                  <input
                    className="w3-input w3-border"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />

                  <label>Sukunimi *</label>
                  <input
                    className="w3-input w3-border"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />

                  <label>Sähköposti *</label>
                  <input
                    className="w3-input w3-border"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />

                  <label>Puhelinnumero (valinnainen)</label>
                  <input
                    className="w3-input w3-border"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />

                  {error && (
                    <p className="w3-text-red w3-small w3-margin-top">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w3-button w3-red w3-margin-top"
                  >
                    Lähetä ilmoittautuminen
                  </button>
                </form>
              ) : (
                <div className="w3-panel w3-pale-green w3-leftbar w3-border-green w3-padding">
                  <p>
                    <strong>Tervetuloa</strong> seuraavalle tunnille, jotka
                    pidetään seuraavan aikataulun mukaisesti: <br />
                    <b>Ma ja Ke klo 19:00–20:30</b> <br />
                    <b>Pe klo 18:00–19:30</b>
                  </p>
                  <p>
                    Tarvitset urheiluvaatteet ja sisäliikuntakengät sekä
                    vesipullon. Jos sinulla ei ole omia nyrkkeilyhanskoja, voit
                    lainata ne harjoituksen ajaksi.
                  </p>
                  <p className="w3-large">Tervetuloa mukaan!</p>
                </div>
              )}
            </div>

            <footer className="w3-container w3-teal">
              <p>PONS KN - kuntonyrkkeily</p>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
