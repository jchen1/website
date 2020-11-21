import styled from "styled-components";

const RootContainer = styled.div`
  min-height: 100vh;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;

  @media screen and (max-width: 640px) {
    padding: 0 1rem;
  }
`;
export default RootContainer;
