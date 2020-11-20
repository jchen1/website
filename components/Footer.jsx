import React from "react";
import styled from "styled-components";

import { Envelope, Github, Twitter, Linkedin, RSS } from "../components/Icon";
import { Colors } from "../lib/constants";

const Button = styled.div`
  display: inline-block;
  padding: 5px 7px;
`;

const FooterContainer = styled.footer`
  margin-top: 1rem;
  padding: 20px 0;
  text-align: center;
  border-top: 1px solid ${Colors.LIGHT_GRAY};

  @media screen and (min-width: 640px) {
    margin-top: 50px;
  }

  width: 100%;
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
