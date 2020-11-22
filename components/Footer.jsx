import React from "react";
import styled from "styled-components";

import { Envelope, Github, Twitter, Linkedin, RSS } from "../components/Icon";
import { Colors } from "../lib/constants";

const Button = styled.div`
  display: inline-flex;
  padding: 5px 7px;
`;

const FooterContainer = styled.footer`
  margin-top: 2rem;
  padding: 20px 0;
  text-align: center;

  @media screen and (min-width: 640px) {
    margin-top: 50px;
  }

  width: 100%;
  background-color: ${Colors.DARKER_GRAY};

  svg {
    fill: ${Colors.WHITE};
  }
`;

export default function Footer() {
  return (
    <FooterContainer>
      <Button>
        <Envelope eventAction="footer-cta-click" />
      </Button>
      <Button>
        <Github eventAction="footer-cta-click" />
      </Button>
      <Button>
        <Twitter eventAction="footer-cta-click" />
      </Button>
      <Button>
        <Linkedin eventAction="footer-cta-click" />
      </Button>
      <Button>
        <RSS eventAction="footer-cta-click" />
      </Button>
    </FooterContainer>
  );
}
