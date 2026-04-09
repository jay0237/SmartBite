import React from "react";
import { Container } from "reactstrap";
import "../../../styles/common-section.css";

const CommonSection = ({ title, subtitle }) => {
  return (
    <section className="common__section">
      <Container>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </Container>
    </section>
  );
};

export default CommonSection;
