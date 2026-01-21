import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/api";

const NewHome = () => {
  const { user } = useContext(AuthContext);
  // console.log("User from AuthContext:", user);
  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Fetch courses from the server
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await api.get("/courses");
        console.log("data - courses: ", data);
        setCourses(data);
      } catch (error) {
        console.error("Ошибка при загрузке курсов:", error);
      }
    };
    fetchCourses();
  }, []);

  const handleOpenModal = (course) => {
    if (!user) {
      sessionStorage.setItem("pendingCourseId: ", course.id);
      setShowAuthModal(true);
      return;
    }
    setSelectedCourse(course);
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

    if (!user || !selectedCourse) {
      setErrorMessage("You must be logged in to enroll.");
      return;
    }

    try {
      const { data: result } = await api.post("/enrollments", {
        userId: user.id,
        courseId: selectedCourse.id,
      });

      setSuccessMessage(`
      Kurssi: ${result.enrollment.courseTitle}\n
      Summa: ${result.enrollment.invoiceAmount} €\n
      Maksunsaaja: Porvoon Nyrkkeilyseura ry \n
      IBAN: ${result.enrollment.paymentIban}\n
      Viitenumero: ${result.enrollment.paymentReference}\n
      Eräpäivä: ${result.enrollment.invoiceDueDate}`);
      // setTimeout(() => handleCloseModal(), 2000);
    } catch (err) {
      console.error("Ошибка при записи на курс: ", err);
      setErrorMessage("Virhe ilmoittautumisessa. Yritä uudelleen.");
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await api.post("/contact", {
        name: formData.get("name"),
        email: formData.get("email"),
        message: formData.get("message"),
      });
      alert("Viesti lähetetty!");
      e.target.reset();
    } catch {
      alert("Virhe lähetyksessä");
    }
  };

  return (
      <div className="w3-container w3-content" style={{maxWidth: "1400px"}}>
        {/* Team Section */}
        <section className="w3-container w3-padding-64 w3-center" id="team">
          <h2 className="w3-text-teal">Tiimimme</h2>
          <p>Tapaa menestyksemme takana olevat upeat ihmiset</p>

          <div className="w3-row-padding w3-margin-top">
            <div className="w3-half w3-margin-bottom">
              <img
                  src="/images/MikaVuorinen_pons.png"
                  alt="Member 1"
                  style={{
                    width: "200px",
                    height: "200px",
                    objectFit: "cover",
                  }}
                  className="w3-circle w3-hover-opacity"
              />
              <h3>Mika Vuorinen</h3>
              <p>Puheenjohtaja &amp; vetäjä</p>
            </div>

            <div className="w3-half w3-margin-bottom">
              <img
                  src="/images/AndyErokhin_pons.png"
                  alt="Member 2"
                  style={{
                    width: "200px",
                    height: "200px",
                    objectFit: "cover",
                  }}
                  className="w3-circle w3-hover-opacity"
              />
              <h3>Andy Erokhin</h3>
              <p>KN-ryhmän ja Nuorten ryhmän vetäjä</p>
            </div>

            {/* <div className="w3-third">
            <img
              src="/images/DimiZhuravel_pons.png"
              alt="Member 3"
              style={{
                width: "200px",
                height: "200px",
                objectFit: "cover",
              }}
              className="w3-circle w3-hover-opacity"
            />
            <h3>Dimi Zhuravel</h3>
            <p>Nuorten ja kilpa ryhmien vetäjä</p>
          </div> */}
          </div>
        </section>

        {/*  Koulutuskurssit */}
        <section className="w3-container w3-padding-32 w3-center w3-asphalt"
                 id="koulutuskurssit">
          {/* Заголовок и описание */}
          <div className="w3-row">
            <div className="w3-col m12 l3 w3-padding">
              <h2 className="w3-text-teal">Harjoitusryhmämme</h2>
              <p className="w3-left-align">
                Etsitkö tavoitteellista treenaamista tai sopivaa ryhmää nuorelle
                harrastajalle? Tarjoamme laadukkaita harjoitusohjelmia
                kilpanyrkkeilystä aina nuorisoryhmään ja kilparyhmään.
              </p>
              <p className="w3-left-align">
                Harjoitukset ohjataan koulutettujen ja tutkinnon suorittaneiden
                ammattilaisten toimesta — jokainen omalla erityisalallaan.
              </p>
            </div>

            {/* Карточки курсов */}
            <div className="w3-col m12 l9">
              <div className="w3-row-padding">
                {/* Карточка 1 */}
                <div className="w3-col s12 m6 l4 w3-margin-bottom">
                  <div
                      className="w3-card w3-white w3-hover-shadow"
                      style={{height: "100%"}}
                  >
                    <img
                        src="/images/kn_pons.jpg"
                        alt="kuntonyrkkeily"
                        className="w3-image"
                        style={{
                          height: "200px",
                          width: "100%",
                          objectFit: "cover",
                        }}
                    />
                    <div
                        className="w3-container w3-padding-16"
                        style={{
                          height: "calc(100% - 200px)",
                          display: "flex",
                          flexDirection: "column",
                        }}
                    >
                      <h3>
                        <b>Kuntonyrkkeily</b>
                      </h3>
                      <h4 className="w3-text-teal">Löydä vahvuutesi</h4>
                      <p style={{flexGrow: 1, marginBottom: 0, marginTop: 0}}>
                        Energinen treenimuoto joka kohottaa kuntoa ja parantaa
                        kehonhallintaa. Sopii kaikille tasoille.
                      </p>
                      <p className="w3-text-grey">
                        <i className="fa fa-user w3-margin-right"></i>15+ vuotta
                      </p>
                    </div>
                  </div>
                </div>

                {/* Карточка 2 */}
                <div className="w3-col s12 m6 l4 w3-margin-bottom">
                  <div
                      className="w3-card w3-white w3-hover-shadow"
                      style={{height: "100%"}}
                  >
                    <img
                        src="/images/nuoriso_pons.jpg"
                        alt="nuorten ryhmä"
                        className="w3-image"
                        style={{
                          height: "200px",
                          width: "100%",
                          objectFit: "cover",
                        }}
                        // style={{ height: "200px", objectFit: "cover" }}
                    />
                    <div
                        className="w3-container w3-padding-16"
                        style={{
                          height: "calc(100% - 200px)",
                          display: "flex",
                          flexDirection: "column",
                        }}
                    >
                      <h3>
                        <b>Nuorten ryhmä</b>
                      </h3>
                      <h4 className="w3-text-teal" style={{fontSize: "18px"}}>
                        Itsevarmuutta ja yhteishenkeä
                      </h4>
                      <p style={{flexGrow: 1}}>
                        Turvallinen ympäristö 12-15-vuotiaille kehittyä fyysisesti
                        ja vahvistaa itseluottamusta.
                      </p>
                      <p className="w3-text-grey">
                        <i className="fa fa-user w3-margin-right"></i>12-15 vuotta
                      </p>
                    </div>
                  </div>
                </div>

                {/* Карточка 3 */}
                <div className="w3-col s12 m6 l4 w3-margin-bottom">
                  <div
                      className="w3-card w3-white w3-hover-shadow"
                      style={{height: "100%"}}
                  >
                    <img
                        src="/images/kilpa_pons.jpg"
                        alt="kilparyhmä"
                        className="w3-image"
                        style={{
                          height: "200px",
                          width: "100%",
                          objectFit: "cover",
                        }}
                    />
                    <div
                        className="w3-container w3-padding-16"
                        style={{
                          height: "calc(100% - 200px)",
                          display: "flex",
                          flexDirection: "column",
                        }}
                    >
                      <h3>
                        <b>Kilpa ryhmä</b>
                      </h3>
                      <h4 className="w3-text-teal">
                        Tavoitteellista harjoittelua
                      </h4>
                      <p style={{flexGrow: 1}}>
                        Ammattivalmennus kilpailijoiden teknisen osaamisen ja
                        henkisen vahvuuden kehittämiseen.
                      </p>
                      <p className="w3-text-grey">
                        <i className="fa fa-user w3-margin-right"></i>15+ vuotta
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Harjoituskurssit / Hinnasto */}
        <section className="w3-container w3-padding-64 w3-center" id="pricing">
          <h2 className="w3-text-teal">
            Ammattilaisten valmentama nyrkkeilykoulutus
          </h2>
          <p className="w3-large">
            Paranna kuntoasi, oppia uusia taitoja ja liity yhteisöömme!
          </p>

          <div className="w3-row-padding w3-margin-top w3-center">
            {courses.map((course) => (
                <div key={course.id} className="w3-third w3-margin-bottom">
                  <ul className="w3-ul w3-border w3-hover-shadow w3-white w3-card-4">
                    <li
                        className={
                          course.title === "Nuoriso ryhmä"
                              ? "w3-gray w3-padding-16"
                              : "w3-theme w3-padding-16"
                        }
                    >
                      <p className="w3-xlarge w3-margin-0">
                        {course.title === "KN - kuntonyrkkeily" &&
                            "KuntoNyrkkeily - Tehokas ja turvallinen treeni"}
                        {course.title === "Nuoriso ryhmä" &&
                            "Nuorten Nyrkkeily - Hauska liikunta 12-15-vuotiaille"}
                        {course.title === "Kilparyhmä" &&
                            "KilpaNyrkkeily - Harrasta lajia ammattimaisesti"}
                      </p>
                    </li>
                    <li
                        className="w3-padding-16"
                        style={{
                          height: "150px",
                          overflowY: "auto",
                          minHeight: "150px",
                        }}
                    >
                      <p>
                        {course.title === "KN - kuntonyrkkeily" &&
                            "Polta kalorit ja paranna kuntoasi hauskassa ryhmätreenissä. Sopii aloittelijoille ja edistyneille!"}
                        {course.title === "Nuoriso ryhmä" &&
                            "Nuorten turvallinen ja motivoiva nyrkkeilyohjelma. Kehitä itsevarmuutta, kuntoa ja tiimityötaitoja!"}
                        {course.title === "Kilparyhmä" &&
                            "Valmistaudu kilpailuihin ammattivalmentajien johdolla. Tekninen harjoittelu ja ottelukokemus."}
                        <br/>
                        <br/>
                        <span className="w3-text-teal">✓ {course.description}</span>
                      </p>
                    </li>
                    <li className="w3-padding-16">
                      <p>
                        <i className="fa fa-calendar w3-text-teal"></i>{" "}
                        <b>Harjoitusajat:</b>{" "}
                        {course.title === "Nuoriso ryhmä"
                            ? "Tiistai & Torstai 16.30 - 17.30   "
                            : "Ma, Ke 19-20.30 & Pe 18-19.30"}
                      </p>
                    </li>
                    <li className="w3-padding-16">
                      <p>
                        <i className="fa fa-clock-o w3-text-teal"></i> <b>Kesto:</b>{" "}
                        {course.title === "Nuoriso ryhmä"
                            ? "46 treeniä"
                            : "66 treeniä"}{" "}
                        (
                        {course.title === "Nuoriso ryhmä"
                            ? "2 krt/viikossa"
                            : "3 krt/viikossa"}
                        )
                      </p>
                    </li>
                    <li className="w3-padding-16">
                      <p>
                        <i className="fa fa-trophy w3-text-teal"></i>{" "}
                        <b>Sisältö:</b>{" "}
                        {course.title === "Nuoriso ryhmä"
                            ? "Perustekniikat ja liikunta"
                            : "Tekniikka, kunto ja strategia"}
                      </p>
                    </li>
                    <li className="w3-padding-16 w3-light-grey">
                      <p className="w3-large">
                        <i className="fa fa-eur w3-text-teal"></i>{" "}
                        <b>{course.price}</b>
                        <span className="w3-small"> / kausi</span>
                        <br/>
                        <span className="w3-small">
                      (
                          {course.title === "Nuoriso ryhmä"
                              ? "2,94 €/treeni"
                              : "2,65 €/treeni"}
                          )
                    </span>
                      </p>
                    </li>
                    <li className="w3-padding-16">
                      <p>
                        <i className="fa fa-star w3-text-teal"></i> <b>Alkaa:</b>{" "}
                        {new Date(course.startDate).toLocaleDateString("fi-FI")}
                      </p>
                    </li>
                    <li className="w3-theme-l5 w3-padding-24">
                      <button
                          className="w3-button w3-teal w3-round-large w3-padding-large enroll-button"
                          onClick={() => handleOpenModal(course)}
                          disabled={course.title === "Kilparyhmä"}
                      >
                        <i className="fa fa-check"></i> <b>ILMOITTAUDU NYT</b>
                      </button>
                    </li>
                  </ul>
                </div>
            ))}
          </div>
        </section>

        {/* Modal */}
        {isModalOpen && selectedCourse && (
            <div className="w3-modal" style={{display: "block"}}>
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

                  {!successMessage && (
                      <button className="w3-button w3-teal w3-round" type="submit">
                        Vahvista ilmoittautuminen
                      </button>
                  )}
                </form>

                {successMessage && (
                    <div
                        className="w3-panel w3-text-red w3-margin-top"
                        style={{whiteSpace: "pre-line"}}
                    >
                      <h3>Ilmoittautuminen onnistui!</h3>
                    </div>
                )}
                {successMessage && (
                    <div
                        className="w3-panel w3-green w3-margin-top "
                        style={{whiteSpace: "pre-line", paddingBottom: "16px"}}
                    >
                      {successMessage}
                    </div>
                )}
                {successMessage && (
                    <div className="w3-panel w3-margin-top">
                      <p>Kaikki maksutiedot on myös oma profiilisivullasi.</p>
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
        <section className="w3-container w3-padding-64 w3-asphalt" id="contact">
          <h2 className="w3-text-teal w3-center">Ota yhteyttä</h2>
          <p className="w3-center">Haluaisimme kuulla sinusta</p>

          <div className="w3-row-padding w3-margin-top">
            {/* Левая колонка */}
            <div className="w3-half">
              <form
                  onSubmit={handleContactSubmit}
                  className="w3-container w3-card w3-padding"
              >
                <p>
                  <label>Nimi</label>
                  <input className="w3-input w3-border" type="text" name="name" required />
                </p>
                <p>
                  <label>Email</label>
                  <input className="w3-input w3-border" type="email" name="email" required />
                </p>
                <p>
                  <label>Viesti</label>
                  <textarea className="w3-input w3-border" name="message" rows={5} required />
                </p>
                <p>
                  <button className="w3-button w3-teal" type="submit">
                    Lähetä
                  </button>
                </p>
              </form>
            </div>

            {/* Правая колонка */}
            <div className="w3-half">
              <div className="w3-light-grey w3-padding-16">
                {/* Harjoituspaikka */}
                <div className="w3-container">
                  <h3 className="w3-text-theme">
                    <i className="fa fa-map-marker w3-margin-right"></i>
                    Harjoituspaikka
                  </h3>

                  <p className="w3-text-red">
                    <strong>Porvoon Urheiluhallin nyrkkeilysali</strong>
                  </p>

                  <p>Sparrenkatu 2, 06100 Porvoo</p>

                  <p className="w3-small w3-text-grey">
                    Sisäänkäynti löytyy Laivurinkadun päädystä.
                  </p>

                  <a
                      href="https://www.google.com/maps/dir/?api=1&destination=Borg%C3%A5+idrottshall"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w3-button w3-teal w3-round w3-margin-top"
                  >
                    📍 Avaa reitti Google Mapsissa
                  </a>
                </div>

                {/* Yhteystiedot */}
                <div className="w3-container w3-margin-top">
                  <h3 className="w3-text-theme">
                    <i className="fa fa-envelope w3-margin-right"></i>
                    Yhteystiedot
                  </h3>

                  <p>
                    <i className="fa fa-user w3-margin-right"></i>
                    Mika Vuorinen, puheenjohtaja
                  </p>

                  <p>
                    <i className="fa fa-envelope w3-margin-right"></i>
                    <a
                        href="mailto:mikvuo.pns@gmail.com"
                        className="w3-text-dark-grey"
                    >
                      mikvuo.pns@gmail.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Image of location/map */}
        <div
            className="w3-margin-bottom w3-round-large"
            style={{ width: "100%", height: "400px", overflow: "hidden" }}
        >
          <iframe
              title="Porvoon Urheiluhalli"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d788.0607014521014!2d25.673427424412164!3d60.38975536912325!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4691f42cfc77cb8b%3A0xc32677dd34de1214!2sBorg%C3%A5%20idrottshall!5e0!3m2!1sen!2sfi!4v1768994014713!5m2!1sen!2sfi"
              style={{
                border: 0,
                width: "100%",
                height: "100%",
              }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-cross-origin"
          />
        </div>

        {/*---auth modalwindow---*/}
        {showAuthModal && (
            <div className="w3-modal" style={{display: "block"}}>
              <div className="w3-modal-content w3-card-4 w3-animate-top">
                <header className="w3-container w3-red w3-display-container">
              <span
                  onClick={() => setShowAuthModal(false)}
                  className="w3-button w3-red w3-display-topright"
              >
                <i className="fa fa-remove"></i>
              </span>
                  <h4>Kirjautuminen vaaditaan</h4>
                </header>
                <div className="w3-container w3-padding">
                  <p>
                    Kirjaudu sisään tai rekisteröidy ilmoittautuaksesi kurssille.
                  </p>
                  <div className="w3-bar w3-margin-top">
                    <button
                        onClick={() => {
                          setShowAuthModal(false);
                          window?.openLoginModal?.();
                        }}
                        className="w3-bar-item w3-button w3-teal w3-round w3-margin-right"
                    >
                      Kirjaudu
                    </button>
                    <button
                        onClick={() => {
                          setShowAuthModal(false);
                          window?.openRegisterModal?.();
                        }}
                        className="w3-bar-item w3-button w3-light-grey w3-round"
                    >
                      Rekisteröidy
                    </button>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default NewHome;
