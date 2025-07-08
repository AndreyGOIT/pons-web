import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const courses = {
  KN: { id: "1", title: "Kuntonyrkkeily" },
  NUORISO: { id: "2", title: "Nuoriso ryhmä" },
  KILPA: { id: "3", title: "Kilparyhmä" },
};

const NewHome = () => {
  const { user } = useContext(AuthContext); // Предполагается, что user = { id, name, email, ... }
  console.log("User from AuthContext:", user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleOpenModal = (courseKey) => {
    if (!user) {
      alert("Kirjaudu ensin sisään ilmoittautuaksesi.");
      return;
    }
    console.log("user в сеансе выбора курса существует: ", user);
    setSelectedCourse(courses[courseKey]);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    const token = localStorage.getItem("token"); // или из контекста
    try {
      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          courseId: selectedCourse.id,
        }),
      });

      if (!response.ok) throw new Error("Enrollment failed.");

      const result = await response.json();
      console.log("результат при регистрации: ", result);
      setSuccessMessage(`Ilmoittautuminen onnistui! 
        Kurssi: ${result.enrollment.courseTitle}
        Summa: ${result.enrollment.invoiceAmount} €
        IBAN: ${result.enrollment.paymentIban}
        Viitenumero: ${result.enrollment.paymentReference}
        Eräpäivä: ${result.enrollment.invoiceDueDate}
        `);
      // setTimeout(() => handleCloseModal(), 2000);
    } catch (err) {
      console.error("error: ", err);
      setErrorMessage("Virhe ilmoittautumisessa. Yritä uudelleen.");
    }
  };

  return (
    <div>
      {/* Team Section */}
      <section className="w3-container w3-padding-64 w3-center" id="team">
        <h2 className="w3-text-teal">Our Team</h2>
        <p>Meet the amazing people behind our success</p>

        <div className="w3-row-padding w3-margin-top">
          <div className="w3-third">
            <img
              src="https://www.w3schools.com/w3images/team1.jpg"
              alt="Member 1"
              style={{ width: "100%" }}
              className="w3-circle w3-hover-opacity"
            />
            <h3>Anna Smith</h3>
            <p>CEO &amp; Founder</p>
          </div>

          <div className="w3-third">
            <img
              src="https://www.w3schools.com/w3images/team2.jpg"
              alt="Member 2"
              style={{ width: "100%" }}
              className="w3-circle w3-hover-opacity"
            />
            <h3>John Doe</h3>
            <p>Lead Developer</p>
          </div>

          <div className="w3-third">
            <img
              src="https://www.w3schools.com/w3images/team3.jpg"
              alt="Member 3"
              style={{ width: "100%" }}
              className="w3-circle w3-hover-opacity"
            />
            <h3>Mary Johnson</h3>
            <p>Marketing Specialist</p>
          </div>
        </div>
      </section>
      {/* Work Section */}
      <section className="w3-container w3-padding-64 w3-light-grey" id="work">
        <h2 className="w3-text-teal w3-center">Our Work</h2>
        <p className="w3-center">Some examples of our projects</p>

        <div className="w3-row-padding w3-margin-top">
          <div className="w3-third w3-margin-bottom">
            <img
              src="https://www.w3schools.com/w3images/work1.jpg"
              alt="Project 1"
              style={{ width: "100%" }}
            />
            <h3>Project One</h3>
            <p>Description of project one.</p>
          </div>

          <div className="w3-third w3-margin-bottom">
            <img
              src="https://www.w3schools.com/w3images/work2.jpg"
              alt="Project 2"
              style={{ width: "100%" }}
            />
            <h3>Project Two</h3>
            <p>Description of project two.</p>
          </div>

          <div className="w3-third w3-margin-bottom">
            <img
              src="https://www.w3schools.com/w3images/work3.jpg"
              alt="Project 3"
              style={{ width: "100%" }}
            />
            <h3>Project Three</h3>
            <p>Description of project three.</p>
          </div>
        </div>
      </section>
      {/* Pricing */}
      <section className="w3-container w3-padding-64 w3-center" id="pricing">
        <h2 className="w3-text-teal">Pricing</h2>
        <p>Choose the best plan for your needs</p>

        <div className="w3-row-padding w3-margin-top">
          <div className="w3-third w3-card w3-padding w3-margin-bottom">
            <h3>{courses.KN.title} / KN</h3>
            <p className="w3-large">€175 / syyskausi</p>
            <p>
              Monipuolinen ja aktiivinen treeni, joten tulet hyvään kuntoon.
            </p>
            <p>Ikä: 15 vuotta alkaen</p>
            <button
              className="w3-button w3-teal w3-round"
              onClick={() => handleOpenModal("KN")}
            >
              Sign Up
            </button>
          </div>

          <div className="w3-third w3-card w3-padding w3-margin-bottom w3-teal w3-text-white">
            <h3>{courses.NUORISO.title}</h3>
            <p className="w3-large">€150 / syyskausi</p>
            <p>Nyrkkeilytreeni ja aktiviteetti nuorisolle</p>
            <p>Ikä: 10–14 vuotta</p>
            <button
              className="w3-button w3-white w3-round"
              onClick={() => handleOpenModal("NUORISO")}
            >
              Sign Up
            </button>
          </div>

          <div className="w3-third w3-card w3-padding w3-margin-bottom">
            <h3>{courses.KILPA.title}</h3>
            <p className="w3-large">€200 / syyskausi</p>
            <p>Nyrkkeilytreenit kilpaavalle treenaajalle</p>
            <p>Ikä: 15 vuotta alkaen</p>
            <button
              className="w3-button w3-teal w3-round"
              onClick={() => handleOpenModal("KILPA")}
            >
              Sign Up
            </button>
          </div>
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && selectedCourse && (
        <div className="w3-modal" style={{ display: "block" }}>
          <div className="w3-modal-content w3-animate-top w3-card-4 w3-padding">
            <span
              onClick={handleCloseModal}
              className="w3-button w3-display-topright"
            >
              &times;
            </span>
            <h2>Ilmoittautuminen: {selectedCourse.title}</h2>

            <form onSubmit={handleSubmit} className="w3-container">
              <p>Käyttäjä: {user?.name}</p>
              <p>Sähköposti: {user?.email}</p>

              <button className="w3-button w3-teal w3-round" type="submit">
                Vahvista ilmoittautuminen
              </button>
            </form>

            {successMessage && (
              <div className="w3-panel w3-green w3-margin-top">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="w3-panel w3-red w3-margin-top">
                {errorMessage}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact Us section */}
      <section className="w3-container w3-padding-64" id="contact">
        <h2 className="w3-text-teal w3-center">Contact Us</h2>
        <p className="w3-center">We&apos;d love to hear from you</p>

        <div className="w3-row-padding w3-margin-top">
          <div className="w3-half">
            <form
              action="/submit_contact"
              method="post"
              className="w3-container w3-card w3-padding"
            >
              <p>
                <label>Name</label>
                <input
                  className="w3-input w3-border"
                  type="text"
                  name="name"
                  required
                />
              </p>
              <p>
                <label>Email</label>
                <input
                  className="w3-input w3-border"
                  type="email"
                  name="email"
                  required
                />
              </p>
              <p>
                <label>Message</label>
                <textarea
                  className="w3-input w3-border"
                  name="message"
                  rows="5"
                  required
                />
              </p>
              <p>
                <button className="w3-button w3-teal" type="submit">
                  Send
                </button>
              </p>
            </form>
          </div>

          <div className="w3-half w3-container">
            <h3>Our Office</h3>
            <p>1234 Street Name</p>
            <p>City, State, ZIP</p>
            <p>Phone: +1 234 567 890</p>
            <p>Email: info@example.com</p>
          </div>
        </div>
      </section>
      {/*<!-- Image of location/map -->*/}
      <img
        src="https://www.w3schools.com/w3images/map.jpg"
        className="w3-image w3-greyscale-min"
        style={{ width: "100%" }}
      />
    </div>
  );
};

export default NewHome;
