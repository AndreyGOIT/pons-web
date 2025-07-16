import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

const NewHome = () => {
  const { user } = useContext(AuthContext); // Предполагается, что user = { id, name, email, ... }
  console.log("User from AuthContext:", user);
  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch courses from the server
  useEffect(() => {
    const fetchCourses = async () => {
      const res = await fetch("/api/courses");
      const data = await res.json();
      console.log("data - courses: ", data);
      setCourses(data);
    };
    fetchCourses();
  }, []);

  const handleOpenModal = (course) => {
    if (!user) {
      alert("Kirjaudu ensin sisään ilmoittautuaksesi.");
      return;
    }
    console.log("user в сеансе выбора курса существует: ", user);
    setSelectedCourse(course);
    // setSelectedCourse(courses[courseKey]);
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
    <div className="w3-container w3-content" style={{ maxWidth: "1400px" }}>
      {/* Team Section */}
      <section className="w3-container w3-padding-64 w3-center" id="team">
        <h2 className="w3-text-teal">Our Team</h2>
        <p>Meet the amazing people behind our success</p>

        <div className="w3-row-padding w3-margin-top">
          <div className="w3-third">
            <img
              src="https://www.w3schools.com/w3images/avatar.jpg"
              alt="Member 1"
              style={{ width: "45%" }}
              className="w3-circle w3-hover-opacity"
            />
            <h3>Mika Vuorinen</h3>
            <p>Puheenjohtaja &amp; vetäjä</p>
          </div>

          <div className="w3-third">
            <img
              src="https://www.w3schools.com/w3images/avatar.jpg"
              alt="Member 2"
              style={{ width: "45%" }}
              className="w3-circle w3-hover-opacity"
            />
            <h3>Andy Erokhin</h3>
            <p>KN-ryhmän vetäjä</p>
          </div>

          <div className="w3-third">
            <img
              src="https://www.w3schools.com/w3images/avatar.jpg"
              alt="Member 3"
              style={{ width: "45%" }}
              className="w3-circle w3-hover-opacity"
            />
            <h3>Dimi Zuravel</h3>
            <p>Nuorten ja kilpa ryhmienn vetäjä</p>
          </div>
        </div>
      </section>

      {/*  Koulutuskurssit */}
      <section
        className="w3-container w3-padding-64 w3-center"
        id="koulutuskurssit"
      >
        <div className="w3-row-padding w3-padding-64 w3-theme-l1">
          <div className="w3-quarter">
            <h2>Harjoitusryhmämme</h2>
            <p>
              Etsitkö tavoitteellista treenaamista tai sopivaa ryhmää nuorelle
              harrastajalle? Tarjoamme laadukkaita harjoitusohjelmia
              kilpanyrkkeilystä aina nuorisoryhmään ja kilparyhmään. Meillä
              jokainen löytää paikkansa — oli tavoitteenasi kilpailla, kehittyä
              tai löytää yhteisö, joka tukee matkaasi. Tule mukaan ja löydä oma
              polkusi nyrkkeilyn maailmassa!
            </p>
          </div>

          <div className="w3-quarter w3-margin-bottom">
            <div className="w3-card w3-white">
              <img
                src="/images/kn_pons.jpg"
                alt="kuntonyrkkeily"
                style={{
                  width: "100%",
                  height: "200px", // можно изменить по необходимости
                  objectFit: "cover",
                }}
              />
              <div className="w3-container">
                <h3>Kuntonyrkkeily</h3>
                <h4>Löydä vahvuutesi – hikoile, kehity ja nauti!</h4>
                <p>
                  Kuntonyrkkeily on energinen ja mukaansatempaava treenimuoto,
                  joka kohottaa kuntoa, parantaa kehonhallintaa ja vapauttaa
                  arjen paineista. Tunnit ovat monipuolisia, innostavia ja
                  sopivat kaikille – olitpa vasta-alkaja tai kokenut liikkuja.
                  Tule mukaan ja koe, miten hauskaa treenaaminen voi olla!
                </p>
                <p>ikä: 15 vuotta alkaen</p>
                <p>treenin pituus: 1 tunti 30 min</p>
                <p>koulutettu vetäjä: Andy Erokhin & Mika Vuorinen</p>
              </div>
            </div>
          </div>

          <div className="w3-quarter w3-margin-bottom">
            <div className="w3-card w3-white">
              <img
                src="/images/nuoriso_pons.jpg"
                alt="nuorten ryhmä"
                style={{
                  width: "100%",
                  height: "200px", // можно изменить по необходимости
                  objectFit: "cover",
                }}
              />
              <div className="w3-container">
                <h3>Nuorten ryhmä</h3>
                <h4>Itsevarmuutta, liikettä ja yhteishenkeä!</h4>
                <p>
                  Nuorten ryhmä on suunnattu 12–15-vuotiaille, jotka haluavat
                  kehittää fyysistä kuntoaan, oppia uusia taitoja ja vahvistaa
                  itseluottamustaan turvallisessa ja kannustavassa ilmapiirissä.
                  Harjoituksissa yhdistyvät liikunnan ilo, itsekurin opettelu ja
                  ryhmähengen voima. Tule mukaan – täällä kasvetaan vahvoiksi
                  sekä keholta että mieleltä!
                </p>
                {/* <p>ikä: 12 - 15 vuotta</p> */}
                <p>treeni: 1 tunti kahdesti viikossa</p>
                <p>
                  koulutettu vetäjä: Dimi Zuravel, Andy Erokhin, Mika Vuorinen
                </p>
              </div>
            </div>
          </div>

          <div className="w3-quarter w3-margin-bottom">
            <div className="w3-card w3-white">
              <img
                src="/images/kilpa_pons.jpg"
                alt="kilparyhmä"
                style={{
                  width: "100%",
                  height: "200px", // можно изменить по необходимости
                  objectFit: "cover",
                }}
              />
              <div className="w3-container">
                <h3>Kilpa ryhmä</h3>
                <h4>Tavoitteellista harjoittelua ja vahvaa asennetta!</h4>
                <p>
                  Kilparyhmä on tarkoitettu niille, joilla on intohimo kehittyä
                  nyrkkeilijänä ja kilpailla tavoitteellisesti. Harjoituksissa
                  keskitytään tekniseen osaamiseen, fyysiseen kuntoon ja
                  henkiseen vahvuuteen. Valmennus on ammattimaista ja
                  yksilöllisesti ohjattua. Jos olet valmis haastamaan itsesi ja
                  tähtäät kehään – tämä ryhmä on sinua varten!
                </p>
                <p>ikä: 15 vuotta alkaen</p>
                {/* <p>treeni: 1,5 tuntia kahdesti viikossa</p> */}
                <p>koulutettu vetäjä: Dimi Zuravel</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Harjoituskurssit / Hinnasto */}
      <section className="w3-container w3-padding-64 w3-center" id="pricing">
        <h2 className="w3-text-teal">Kurssit ja hinnasto</h2>
        <p className="w3-large">Valitse sinulle sopiva harjoitusryhmä</p>

        <div className="w3-row-padding w3-margin-top w3-center">
          {courses.map((course) => (
            <div key={course.id} className="w3-third w3-margin-bottom">
              <ul className="w3-ul w3-border w3-hover-shadow w3-white w3-card-4">
                <li className="w3-theme w3-padding-16">
                  <p className="w3-xlarge w3-margin-0">{course.title}</p>
                </li>
                <li className="w3-padding-16">
                  <p>{course.description}</p>
                </li>
                <li className="w3-padding-16">
                  <h2 className="w3-wide">
                    <i className="fa fa-eur"></i> {course.price}
                  </h2>
                  <span className="w3-opacity">/ syyskausi</span>
                </li>
                <li className="w3-padding-16">
                  <p className="w3-small">
                    {new Date(course.startDate).toLocaleDateString("fi-FI")} –{" "}
                    {new Date(course.endDate).toLocaleDateString("fi-FI")}
                  </p>
                </li>
                <li className="w3-theme-l5 w3-padding-24">
                  <button
                    className="w3-button w3-teal w3-round-large"
                    onClick={() => handleOpenModal(course)}
                  >
                    <i className="fa fa-check"></i> Ilmoittaudu
                  </button>
                </li>
              </ul>
            </div>
          ))}
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

          <div className="w3-row-padding w3-margin-top w3-light-grey w3-padding-32 w3-half">
            {/* Harjoituspaikka */}
            <div className=" w3-container">
              <h3 className="w3-text-theme">
                <i className="fa fa-map-marker w3-margin-right"></i>
                Harjoituspaikka
              </h3>
              <p>
                <strong>Porvoon Urheiluhallin nyrkkeilysali</strong>
              </p>
              <p>Sparrenkatu 2, 06100 Porvoo</p>
              <p className="w3-small w3-text-grey">
                Sisäänkäynti löytyy Laivurinkadun päädystä.
              </p>
            </div>

            {/* Yhteystiedot */}
            <div className=" w3-container">
              <h3 className="w3-text-theme">
                <i className="fa fa-envelope w3-margin-right"></i>Yhteystiedot
              </h3>
              <p>
                <i className="fa fa-user w3-margin-right"></i>Mika Vuorinen,
                puheenjohtaja
              </p>
              <p>
                <i className="fa fa-envelope w3-margin-right"></i>
                <a
                  href="mailto:mika.vuorinen@pons.fi"
                  className="w3-text-dark-grey"
                >
                  mika.vuorinen@pons.fi
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/*<!-- Image of location/map -->*/}
      <img
        src="/images/Porvoon_Urheiluhalli.png"
        // src="https://www.w3schools.com/w3images/map.jpg"
        className="w3-image w3-greyscale-min w3-margin-bottom"
        style={{ width: "100%" }}
      />
    </div>
  );
};

export default NewHome;
