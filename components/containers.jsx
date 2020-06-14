import styled from "styled-components";
import { GRAY, LIGHT_GRAY } from "../lib/constants";

export const RootContainer = styled.div`
  min-height: 100vh;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
`;

export const MainContainer = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
`;

export const TitleContainer = styled.div`
  display: flex;
  margin: 0 0 1rem 0;
  align-items: center;
  justify-content: space-evenly;

  h1 {
    font-size: 3rem;
    margin: 0;
  }
`;

export const BlogContainer = styled.article`
  max-width: 740px;
  padding-bottom: 2em;
  border-bottom: 1px solid ${LIGHT_GRAY};
  width: 100%;

  &:last-child {
    padding-bottom: 1em;
    border-bottom: none;
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
    color: ${GRAY};
    font-size: 22px;
    font-style: italic;
  }
`;
