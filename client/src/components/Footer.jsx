import React from "react";

const Footer = () => {
  return (
    <div>
      {/*<!-- Footer -->*/}
      <footer className="w3-container w3-padding-32 w3-theme-d1 w3-center">
        <h4>Follow Us</h4>
        <a
          className="w3-button w3-large w3-teal"
          href="javascript:void(0)"
          title="Facebook"
        >
          <i className="fa fa-facebook"></i>
        </a>
        <a
          className="w3-button w3-large w3-teal"
          href="javascript:void(0)"
          title="Twitter"
        >
          <i className="fa fa-twitter"></i>
        </a>
        <a
          className="w3-button w3-large w3-teal"
          href="javascript:void(0)"
          title="Google +"
        >
          <i className="fa fa-google-plus"></i>
        </a>
        <a
          className="w3-button w3-large w3-teal"
          href="javascript:void(0)"
          title="Google +"
        >
          <i className="fa fa-instagram"></i>
        </a>
        <a
          className="w3-button w3-large w3-teal w3-hide-small"
          href="javascript:void(0)"
          title="Linkedin"
        >
          <i className="fa fa-linkedin"></i>
        </a>
        <p>
          Powered by{" "}
          <a href="https://www.w3schools.com/w3css/default.asp" target="_blank">
            w3.css
          </a>
        </p>

        <div
          style={{ position: "relative", bottom: "100px", zIndex: "1" }}
          className="w3-tooltip w3-right"
        >
          <span className="w3-text w3-padding w3-teal w3-hide-small">
            Go To Top
          </span>
          <a className="w3-button w3-theme" href="#myPage">
            <span className="w3-xlarge">
              <i className="fa fa-chevron-circle-up"></i>
            </span>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
