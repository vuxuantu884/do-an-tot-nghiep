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
  .select {
    display: flex;
    align-items: center;
  }
  .paymentSelectIcon {
    margin-right: 5px;
    width: 20px;
  }
`;
