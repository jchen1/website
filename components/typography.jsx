import styled from "styled-components";

import { Colors } from "../lib/constants";

const FONT_FACE = "Inter, sans-serif";

const HeadingDefaults = `
  font-family: ${FONT_FACE};
  color: ${Colors.DARKER_GRAY};
  font-weight: bold;

  line-height: 1.7;
  margin: 1em 0 1rem;
  padding: 0;

  @media screen and (max-width: 640px) {
    line-height: 1.4;
  }
`;

export const H1 = styled.h1`
  ${HeadingDefaults}
  margin: 1em 0 0.25em;
  font-size: 35px;
  letter-spacing: -0.021em;
  a {
    color: inherit;
    text-decoration: none;
  }

  @media screen and (max-width: 640px) {
    font-size: 26px;
    letter-spacing: -0.019em;
  }
`;

export const H2 = styled.h2`
  ${HeadingDefaults}
  font-size: 28px;
  letter-spacing: -0.02em;
  a {
    color: inherit;
    text-decoration: none;
  }

  @media screen and (max-width: 640px) {
    font-size: 23px;
    letter-spacing: -0.019em;
  }
`;

export const H3 = styled.h3`
  ${HeadingDefaults}
  font-size: 22.5px;
  letter-spacing: -0.018em;

  @media screen and (max-width: 640px) {
    font-size: 20px;
    letter-spacing: -0.017em;
  }
`;

export const H4 = styled.h4`
  ${HeadingDefaults}
  color: ${Colors.GRAY};
  font-size: 18px;
  letter-spacing: -0.014em;
`;

export const Small = styled.small`
  font-size: 14px;
  letter-spacing: -0.006em;
`;
