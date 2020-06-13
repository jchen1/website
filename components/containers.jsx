import styled from "styled-components";

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
