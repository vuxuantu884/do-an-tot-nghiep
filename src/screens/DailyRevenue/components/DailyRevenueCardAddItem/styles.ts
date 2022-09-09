import styled from "styled-components";

export const StyledComponent = styled.div`
  .formWrapper {
    position: relative;
    padding-right: 154px;
  }
  .buttonGroup {
    position: absolute;
    top: 0;
    right: 0;
    button {
      &:not(:last-child) {
        margin-right: 10px;
      }
    }
  }
`;
