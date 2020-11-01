import styled from "styled-components";

import { Colors } from "../lib/constants";

const FONT_FACE = "Inter, sans-serif";

const HeadingDefaults = `
  font-family: ${FONT_FACE};
  color: ${Colors.DARKER_GRAY};
  font-weight: bold;

  line-height: 1.7;
  margin: 1em 0 15px;
  padding: 0;

  @media screen and (max-width: 640px) {
    line-height: 1.4;
  }
`;

/*
base size: 18px
https://baseline.is/tools/type-scale-generator/
desktop: major second
  32, 29, 26, 23, 20, 18, 16, 14
mobile: minor second
  25, 23, 22, 20, 19, 18, 17, 16

letter-spacing: https://rsms.me/inter/dynmetrics/
desktop:
  -0.021, -0.021, -0.02, -0.019, -0.014, -0.011, -0.006
mobile:
  -0.019, -0.019, -0.018, -0.018, -0.015, -0.014, -0.013, -0.011
 */

export const H1 = styled.h1`
  ${HeadingDefaults}
  font-size: 32px;
  margin: 1em 0 0;
  letter-spacing: -0.022em;
  a {
    color: inherit;
    text-decoration: none;
  }

  @media screen and (max-width: 640px) {
    font-size: 25px;
    letter-spacing: -0.019em;
  }
`;

export const H2 = styled.h2`
  ${HeadingDefaults}
  font-size: 29px;
  letter-spacing: -0.021em;
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
  font-size: 26px;
  letter-spacing: -0.02em;

  @media screen and (max-width: 640px) {
    font-size: 22px;
    letter-spacing: -0.018em;
  }
`;

export const H4 = styled.h4`
  ${HeadingDefaults}
  color: ${Colors.GRAY};
  font-size: 23px;
  letter-spacing: -0.019em;

  @media screen and (max-width: 640px) {
    font-size: 20px;
    letter-spacing: -0.018em;
  }
`;

export const H5 = styled.h5`
  ${HeadingDefaults}
  font-size: 20px;
  letter-spacing: -0.014em;

  @media screen and (max-width: 640px) {
    font-size: 19px;
    letter-spacing: -0.015em;
  }
`;

export const H6 = styled.h6`
  ${HeadingDefaults}
  font-size: 18px;
  letter-spacing: -0.011em;

  @media screen and (max-width: 640px) {
    font-size: 18px;
    letter-spacing: -0.014em;
  }
`;

export const Small = styled.small`
  font-size: 16px;
  letter-spacing: -0.011em;
`;
