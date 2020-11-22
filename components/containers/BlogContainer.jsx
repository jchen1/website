import styled from "styled-components";

import { Colors } from "../../lib/constants";

export const BlogContainer = styled.article`
  width: 100%;

  display: grid;
  grid-template-columns: 1fr min(45rem, 100%) 1fr;

  & > * {
    grid-column: 2;
  }

  .full-bleed {
    width: 100%;
    grid-column: 1 / -1;
  }

  &:first-child {
    h1 {
      margin-top: 0;
    }
  }

  blockquote {
    margin: 1.8em 0.8em;
    border-left: 2px solid $gray;
    padding: 0.1em 1em;
    color: ${Colors.GRAY};
    font-size: 22px;
  }

  /* images with captions */
  figure {
    padding: 0.75rem 0;
    figcaption {
      padding: 0.75rem 0;
      font-size: small;
      text-align: center;
    }
  }
`;

export const Border = styled.div`
  padding-bottom: 2em;
  border-bottom: 1px solid ${Colors.LIGHT_GRAY};
  width: min(45rem, 100%);
  margin: 0 auto;

  &:last-of-type {
    padding-bottom: 1em;
    border-bottom: none;
  }
`;
