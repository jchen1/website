import React from "react";
import styled from "styled-components";

// https://jam-icons.com/
import Envelope from "../assets/envelope-f.svg";
import Github from "../assets/github.svg";
import Twitter from "../assets/twitter.svg";
import Linkedin from "../assets/linkedin.svg";
import RSS from "../assets/rss-feed.svg";

import { event } from "../lib/gtag";
import { Colors } from "../lib/constants";

const ICON_SIZE = 30;

const Button = styled.a`
  display: inline-block;
  padding: 5px 7px;

  > svg:hover {
    fill: ${Colors.RED};
  }
`;

const FooterContainer = styled.footer`
  margin-top: 50px;
  padding: 20px 0;
  text-align: center;
  border-top: 1px solid ${Colors.LIGHT_GRAY};

  width: 100%;
`;

function sendEvent(name) {
  event({ action: name, label: "footer" });
}

export default function Footer() {
  return (
    <FooterContainer>
      <Button href="mailto:hello@jeff.yt" aria-label="Send me an email!">
        <Envelope
          width={ICON_SIZE}
          height={ICON_SIZE}
          onClick={() => sendEvent("email")}
        />
      </Button>
      <Button href="https://github.com/jchen1" aria-label="Github">
        <Github
          width={ICON_SIZE}
          height={ICON_SIZE}
          onClick={() => sendEvent("github")}
        />
      </Button>
      <Button href="https://www.twitter.com/iambald" aria-label="Twitter">
        <Twitter
          width={ICON_SIZE}
          height={ICON_SIZE}
          onClick={() => sendEvent("twitter")}
        />
      </Button>
      <Button href="https://www.linkedin.com/in/jchen94" aria-label="Linkedin">
        <Linkedin
          width={ICON_SIZE}
          height={ICON_SIZE}
          onClick={() => sendEvent("linkedin")}
        />
      </Button>
      <Button href="/rss-feed.xml" aria-label="RSS Feed">
        <RSS
          width={ICON_SIZE}
          height={ICON_SIZE}
          onClick={() => sendEvent("rss")}
        />
      </Button>
    </FooterContainer>
  );
}
