import React from "react";
import styled from "styled-components";

import { Envelope, Github, Twitter, Linkedin, RSS } from "../components/Icon";
import { Colors } from "../lib/constants";

const Button = styled.div`
  display: inline-block;
  padding: 5px 7px;
`;

const FooterContainer = styled.footer`
  margin-top: 50px;
  padding: 20px 0;
  text-align: center;
  border-top: 1px solid ${Colors.LIGHT_GRAY};

  width: 100%;
`;

export default function Footer() {
  return (
    <FooterContainer>
      <Button>
        <Envelope eventLabel="footer" />
      </Button>
      <Button>
        <Github eventLabel="footer" />
      </Button>
      <Button>
        <Twitter eventLabel="footer" />
      </Button>
      <Button>
        <Linkedin eventLabel="footer" />
      </Button>
      <Button>
        <RSS eventLabel="footer" />
      </Button>
    </FooterContainer>
  );
}
