import React, { useState } from "react";

const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

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

      {/* Hero image */}
      <div className="w3-display-container w3-animate-opacity">
        <img
          src="https://www.w3schools.com/w3images/sailboat.jpg"
          alt="boat"
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

      {/* More sections (Team, Work, Pricing, Contact) can be added below */}
    </>
  );
};

export default Home;

/*----start version----*/
// import React, { useState } from "react";

// const Home = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [modalOpen, setModalOpen] = useState(false);

//   const openNav = () => setSidebarOpen(true);
//   const closeNav = () => setSidebarOpen(false);

//   return (
//     <>
//       {/* Sidebar */}
//       <nav
//         className="w3-sidebar w3-bar-block w3-white w3-card w3-animate-left w3-xxlarge"
//         style={{ display: sidebarOpen ? "block" : "none", zIndex: 2 }}
//         id="mySidebar"
//       >
//         <button
//           className="w3-bar-item w3-button w3-display-topright w3-text-teal"
//           onClick={closeNav}
//         >
//           Close <i className="fa fa-remove"></i>
//         </button>
//         <a href="#" className="w3-bar-item w3-button">
//           Link 1
//         </a>
//         <a href="#" className="w3-bar-item w3-button">
//           Link 2
//         </a>
//         <a href="#" className="w3-bar-item w3-button">
//           Link 3
//         </a>
//         <a href="#" className="w3-bar-item w3-button">
//           Link 4
//         </a>
//         <a href="#" className="w3-bar-item w3-button">
//           Link 5
//         </a>
//       </nav>

//       {/* Navbar */}
//       <div className="w3-top">
//         <div className="w3-bar w3-theme-d2 w3-left-align">
//           <button
//             className="w3-bar-item w3-button w3-hide-medium w3-hide-large w3-right w3-hover-white w3-theme-d2"
//             onClick={openNav}
//           >
//             <i className="fa fa-bars"></i>
//           </button>
//           <a href="#" className="w3-bar-item w3-button w3-teal">
//             <i className="fa fa-home w3-margin-right"></i>Logo
//           </a>
//           <a
//             href="#team"
//             className="w3-bar-item w3-button w3-hide-small w3-hover-white"
//           >
//             Team
//           </a>
//           <a
//             href="#work"
//             className="w3-bar-item w3-button w3-hide-small w3-hover-white"
//           >
//             Work
//           </a>
//           <a
//             href="#pricing"
//             className="w3-bar-item w3-button w3-hide-small w3-hover-white"
//           >
//             Price
//           </a>
//           <a
//             href="#contact"
//             className="w3-bar-item w3-button w3-hide-small w3-hover-white"
//           >
//             Contact
//           </a>
//           <div className="w3-dropdown-hover w3-hide-small">
//             <button className="w3-button" title="Notifications">
//               Dropdown <i className="fa fa-caret-down"></i>
//             </button>
//             <div className="w3-dropdown-content w3-card-4 w3-bar-block">
//               <a href="#" className="w3-bar-item w3-button">
//                 Link
//               </a>
//               <a href="#" className="w3-bar-item w3-button">
//                 Link
//               </a>
//               <a href="#" className="w3-bar-item w3-button">
//                 Link
//               </a>
//             </div>
//           </div>
//           <a
//             href="#"
//             className="w3-bar-item w3-button w3-hide-small w3-right w3-hover-teal"
//             title="Search"
//           >
//             <i className="fa fa-search"></i>
//           </a>
//         </div>
//       </div>

//       {/* Hero image */}
//       <div className="w3-display-container w3-animate-opacity">
//         <img
//           src="https://www.w3schools.com/w3images/sailboat.jpg"
//           alt="boat"
//           style={{ width: "100%", minHeight: "350px", maxHeight: "600px" }}
//         />
//         <div className="w3-container w3-display-bottomleft w3-margin-bottom">
//           <button
//             onClick={() => setModalOpen(true)}
//             className="w3-button w3-xlarge w3-theme w3-hover-teal"
//             title="Go To W3.CSS"
//           >
//             LEARN W3.CSS
//           </button>
//         </div>
//       </div>

//       {/* Modal */}
//       {modalOpen && (
//         <div className="w3-modal" style={{ display: "block" }}>
//           <div className="w3-modal-content w3-card-4 w3-animate-top">
//             <header className="w3-container w3-teal w3-display-container">
//               <span
//                 onClick={() => setModalOpen(false)}
//                 className="w3-button w3-teal w3-display-topright"
//               >
//                 <i className="fa fa-remove"></i>
//               </span>
//               <h4>Oh snap! We just showed you a modal..</h4>
//               <h5>
//                 Because we can <i className="fa fa-smile-o"></i>
//               </h5>
//             </header>
//             <div className="w3-container">
//               <p>Cool huh? Ok, enough teasing around..</p>
//               <p>
//                 Go to our{" "}
//                 <a className="w3-text-teal" href="/w3css/default.asp">
//                   W3.CSS Tutorial
//                 </a>{" "}
//                 to learn more!
//               </p>
//             </div>
//             <footer className="w3-container w3-teal">
//               <p>Modal footer</p>
//             </footer>
//           </div>
//         </div>
//       )}

//       {/* More sections (Team, Work, Pricing, Contact) can be added below */}
//       <section className="w3-container w3-padding-64 w3-center" id="team">
//         <h2 className="w3-text-teal">Our Team</h2>
//         <p>Meet the amazing people behind our success</p>

//         <div className="w3-row-padding w3-margin-top">
//           <div className="w3-third">
//             <img
//               src="https://www.w3schools.com/w3images/team1.jpg"
//               alt="Member 1"
//               style={{ width: "100%" }}
//               className="w3-circle w3-hover-opacity"
//             />
//             <h3>Anna Smith</h3>
//             <p>CEO &amp; Founder</p>
//           </div>

//           <div className="w3-third">
//             <img
//               src="https://www.w3schools.com/w3images/team2.jpg"
//               alt="Member 2"
//               style={{ width: "100%" }}
//               className="w3-circle w3-hover-opacity"
//             />
//             <h3>John Doe</h3>
//             <p>Lead Developer</p>
//           </div>

//           <div className="w3-third">
//             <img
//               src="https://www.w3schools.com/w3images/team3.jpg"
//               alt="Member 3"
//               style={{ width: "100%" }}
//               className="w3-circle w3-hover-opacity"
//             />
//             <h3>Mary Johnson</h3>
//             <p>Marketing Specialist</p>
//           </div>
//         </div>
//       </section>
//       <section className="w3-container w3-padding-64 w3-light-grey" id="work">
//         <h2 className="w3-text-teal w3-center">Our Work</h2>
//         <p className="w3-center">Some examples of our projects</p>

//         <div className="w3-row-padding w3-margin-top">
//           <div className="w3-third w3-margin-bottom">
//             <img
//               src="https://www.w3schools.com/w3images/work1.jpg"
//               alt="Project 1"
//               style={{ width: "100%" }}
//             />
//             <h3>Project One</h3>
//             <p>Description of project one.</p>
//           </div>

//           <div className="w3-third w3-margin-bottom">
//             <img
//               src="https://www.w3schools.com/w3images/work2.jpg"
//               alt="Project 2"
//               style={{ width: "100%" }}
//             />
//             <h3>Project Two</h3>
//             <p>Description of project two.</p>
//           </div>

//           <div className="w3-third w3-margin-bottom">
//             <img
//               src="https://www.w3schools.com/w3images/work3.jpg"
//               alt="Project 3"
//               style={{ width: "100%" }}
//             />
//             <h3>Project Three</h3>
//             <p>Description of project three.</p>
//           </div>
//         </div>
//       </section>
//       <section className="w3-container w3-padding-64 w3-center" id="pricing">
//         <h2 className="w3-text-teal">Pricing</h2>
//         <p>Choose the best plan for your needs</p>

//         <div className="w3-row-padding w3-margin-top">
//           <div className="w3-third w3-card w3-padding w3-margin-bottom">
//             <h3>Basic</h3>
//             <p className="w3-large">$10 / month</p>
//             <p>Essential features</p>
//             <button className="w3-button w3-teal w3-round">Sign Up</button>
//           </div>

//           <div className="w3-third w3-card w3-padding w3-margin-bottom w3-teal w3-text-white">
//             <h3>Pro</h3>
//             <p className="w3-large">$30 / month</p>
//             <p>Most popular features</p>
//             <button className="w3-button w3-white w3-round">Sign Up</button>
//           </div>

//           <div className="w3-third w3-card w3-padding w3-margin-bottom">
//             <h3>Enterprise</h3>
//             <p className="w3-large">$100 / month</p>
//             <p>All features included</p>
//             <button className="w3-button w3-teal w3-round">Sign Up</button>
//           </div>
//         </div>
//       </section>
//       <section className="w3-container w3-padding-64" id="contact">
//         <h2 className="w3-text-teal w3-center">Contact Us</h2>
//         <p className="w3-center">We&apos;d love to hear from you</p>

//         <div className="w3-row-padding w3-margin-top">
//           <div className="w3-half">
//             <form
//               action="/submit_contact"
//               method="post"
//               className="w3-container w3-card w3-padding"
//             >
//               <p>
//                 <label>Name</label>
//                 <input
//                   className="w3-input w3-border"
//                   type="text"
//                   name="name"
//                   required
//                 />
//               </p>
//               <p>
//                 <label>Email</label>
//                 <input
//                   className="w3-input w3-border"
//                   type="email"
//                   name="email"
//                   required
//                 />
//               </p>
//               <p>
//                 <label>Message</label>
//                 <textarea
//                   className="w3-input w3-border"
//                   name="message"
//                   rows="5"
//                   required
//                 />
//               </p>
//               <p>
//                 <button className="w3-button w3-teal" type="submit">
//                   Send
//                 </button>
//               </p>
//             </form>
//           </div>

//           <div className="w3-half w3-container">
//             <h3>Our Office</h3>
//             <p>1234 Street Name</p>
//             <p>City, State, ZIP</p>
//             <p>Phone: +1 234 567 890</p>
//             <p>Email: info@example.com</p>
//           </div>
//         </div>
//       </section>
//       {/*<!-- Image of location/map -->*/}
//       <img
//         src="https://www.w3schools.com/w3images/map.jpg"
//         className="w3-image w3-greyscale-min"
//         style={{ width: "100%" }}
//       />

//       {/*<!-- Footer -->*/}
//       <footer className="w3-container w3-padding-32 w3-theme-d1 w3-center">
//         <h4>Follow Us</h4>
//         <a
//           className="w3-button w3-large w3-teal"
//           href="javascript:void(0)"
//           title="Facebook"
//         >
//           <i className="fa fa-facebook"></i>
//         </a>
//         <a
//           className="w3-button w3-large w3-teal"
//           href="javascript:void(0)"
//           title="Twitter"
//         >
//           <i className="fa fa-twitter"></i>
//         </a>
//         <a
//           className="w3-button w3-large w3-teal"
//           href="javascript:void(0)"
//           title="Google +"
//         >
//           <i className="fa fa-google-plus"></i>
//         </a>
//         <a
//           className="w3-button w3-large w3-teal"
//           href="javascript:void(0)"
//           title="Google +"
//         >
//           <i className="fa fa-instagram"></i>
//         </a>
//         <a
//           className="w3-button w3-large w3-teal w3-hide-small"
//           href="javascript:void(0)"
//           title="Linkedin"
//         >
//           <i className="fa fa-linkedin"></i>
//         </a>
//         <p>
//           Powered by{" "}
//           <a href="https://www.w3schools.com/w3css/default.asp" target="_blank">
//             w3.css
//           </a>
//         </p>

//         <div
//           style={{ position: "relative", bottom: "100px", zIndex: "1" }}
//           className="w3-tooltip w3-right"
//         >
//           <span className="w3-text w3-padding w3-teal w3-hide-small">
//             Go To Top
//           </span>
//           <a className="w3-button w3-theme" href="#myPage">
//             <span className="w3-xlarge">
//               <i className="fa fa-chevron-circle-up"></i>
//             </span>
//           </a>
//         </div>
//       </footer>
//     </>
//   );
// };

// export default Home;
