import styled from "styled-components";

export const StyledComponent = styled.div`
  .ant-tabs-nav {
    position: relative !important;
    z-index: 1 !important;
    width: 100%;
  }
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
    color: #222;
    text-align: right;
    width: 100%;
  }
`;
