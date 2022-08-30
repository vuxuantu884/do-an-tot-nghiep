import styled from "styled-components";

export const StyledComponent = styled.div`
  .buttonReceiveGoodsWrapper {
    display: flex;
    justify-content: flex-start;
    padding: 14px 0 7px 0;
    button {
      padding: 0 25px;
    }
  }
  .buttonReceiveGoodsWrapper {
    &__content {
      display: flex;
    }
    .custom-select {
      margin-right: 20px;
      width: 255px;
    }
  }
  .warningWrapper {
    font-weight: 500;
  }
`;
