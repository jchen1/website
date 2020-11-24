import styled from "styled-components";

const RootContainer = styled.div`
  padding: 0 2rem;
  flex-grow: 1;
  width: 100%;
  margin: 0 auto;

  @media screen and (max-width: 640px) {
    padding: 0 1rem;
  }
`;
export default RootContainer;
