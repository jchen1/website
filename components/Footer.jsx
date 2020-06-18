import React from "react";
import styled from "styled-components";
import { Colors } from "../lib/constants";

const FooterContainer = styled.footer`
  margin-top: 50px;
  padding: 20px 0;
  text-align: center;
  border-top: 1px solid ${Colors.LIGHT_GRAY};

  width: 100%;

  .icon {
    font-size: 20px;
    padding: 5px;
  }
`;

export default function Footer() {
  return (
    <FooterContainer>
      <a href="mailto:hello@jeff.yt">
        <i className="icon fa fa-envelope-o"></i>
      </a>
      <a href="https://github.com/jchen1">
        <i className="icon fa fa-github"></i>
      </a>
      <a href="https://www.twitter.com/iambald">
        <i className="icon fa fa-twitter"></i>
      </a>
      <a href="https://www.linkedin.com/in/jchen94">
        <i className="icon fa fa-linkedin"></i>
      </a>
    </FooterContainer>
  );
}
