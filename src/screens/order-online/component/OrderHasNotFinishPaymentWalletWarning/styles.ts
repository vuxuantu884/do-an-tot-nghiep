import styled from "styled-components";

export const StyledComponent = styled.div`
  .orderPaidByWalletWarning {
    font-weight: 500;
    font-size: 15px;
    padding: 10px 0;
    ul {
      margin-bottom: 0;
    }
    li {
      &:not(:last-child) {
        margin-bottom: 5px;
      }
    }
  }
`;
