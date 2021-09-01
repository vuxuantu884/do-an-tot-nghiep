import styled from "styled-components";

export const StyledComponent = styled.div`
  .orders-shipment {
    .ant-row {
      justify-content: space-between;
    }
    &__dateLabel {
      float: left;
      line-height: 40px;
      margin-right: 10px;
    }
  }
  .formInputAmount {
    text-align: right;
    width: 100%;
    color: #222;
  }
`;
