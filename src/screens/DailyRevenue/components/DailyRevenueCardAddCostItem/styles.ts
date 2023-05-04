import styled from "styled-components";

export const StyledComponent = styled.div`
  .formWrapper {
    position: relative;
  }
  .buttonGroup {
    margin-bottom: 10px;
    text-align: right;
    .inner {
      text-align: center;
    }
    button {
      &:not(:last-child) {
        margin-right: 10px;
      }
    }
  }
  .paymentSelectIcon {
    width: 20px;
    margin-right: 5px;
  }
`;
