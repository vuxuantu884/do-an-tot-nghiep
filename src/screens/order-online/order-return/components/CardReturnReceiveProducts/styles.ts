import styled from "styled-components";

export const StyledComponent = styled.div`
  .ant-tag {
    margin-left: 5px;
  }
  .noBodyCard {
    .ant-card-body {
      padding: 0;
    }
  }
  .receiveProductCard {
    &__content {
      display: flex;
    }
    .custom-select {
      margin-right: 20px;
      width: 255px;
    }
  }
`;
