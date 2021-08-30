import styled from "styled-components";

export const StyledComponent = styled.div`
  form {
    padding-bottom: 150px;
    position: relative;
  }
  .groupButtons {
    background: #fff;
    bottom: 0;
    display: flex;
    justify-content: flex-end;
    left: 240px;
    padding: 20px 20px;
    position: fixed;
    right: 0px;
    z-index: 983;
    button {
      &:not(:last-child) {
        margin-right: 10px;
      }
    }
  }
`;
