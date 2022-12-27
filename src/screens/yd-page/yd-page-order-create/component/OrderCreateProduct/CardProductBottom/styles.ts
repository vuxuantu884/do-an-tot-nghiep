import styled from "styled-components";
import { primaryColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  padding-top: 15px;

  .paymentRow {
    &:not(:last-child) {
      margin-bottom: 10px;
    }
    .discountTitle,
    .couponTitle {
      text-decoration: underline;
      text-decoration-color: ${primaryColor};
      color: ${primaryColor};
    }
  }
  .optionRow {
    &:not(:last-child) {
      margin-bottom: 14px;
    }
  }
  .ant-divider-horizontal {
    margin: 12px 0;
  }

  .ant-card.ant-card-bordered.discount-order-card {
    width: 520px;
    position: absolute;
    // right: 0;
    left: 0;
    top: 24px;

    .ant-card-head-title {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .anticon:hover {
        color: red;
      }
    }
    .ant-card-body {
      padding: 10px;
    }
    .ant-space {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      background: #f0f5ff;
      .ant-btn {
        height: 30px;
        line-height: 30px;
        padding: 0 10px;
        font-weight: 500;
      }
      .promotion-name {
        font-weight: 400;
        font-size: 12px;
        line-height: 20px;
        display: flex;
        img {
          margin-right: 5px;
        }
      }
      .promotion-value {
        font-weight: 600;
        color: #262626;
      }
      .promotion-value-after {
        font-weight: 600;
        color: #52c41a;
      }
    }
  }
`;
