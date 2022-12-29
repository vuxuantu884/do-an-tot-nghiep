import styled from "styled-components";
import { dangerColor, grayF5Color, successColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  padding-top: 15px;

  .paymentRow {
    &:not(:last-child) {
      margin-bottom: 10px;
    }
    .discountTitle,
    .couponTitle {
      text-decoration: underline;
      text-decoration-color: #2f54eb;
      color: #2f54eb;
      span {
        color: #5d5d8a;
        padding-top: 3px;
      }
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
  .noteTooltip {
    margin-left: 5px;
  }
  .discountTag {
    margin-top: 0;
    color: ${dangerColor};
    background: ${grayF5Color};
  }
  .couponTag {
    .ant-tag-close-icon {
      color: ${successColor};
    }
    &--danger {
      margin: 0;
      color: ${dangerColor};
      background: ${grayF5Color};
      text-transform: uppercase;
      .ant-tag-close-icon {
        color: ${dangerColor};
      }
    }
    &__icon {
      margin-right: 5px;
      color: ${successColor};
      &--danger {
        color: ${dangerColor};
      }
    }
  }
  .ant-card.ant-card-bordered.discount-order-card {
    width: 450px;
    position: absolute;
    right: 0;
    top: 24px;
    .ant-card-head {
      padding: 5px 10px;
      min-height: 22px;
      .ant-card-head-title {
        font-size: 13px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .anticon:hover {
          color: red;
        }
      }
    }

    .ant-card-body {
      padding: 5px;
    }
    .ant-space {
      display: flex;
      justify-content: space-between;
      padding: 5px 7px;
      background: #f0f5ff;
      .ant-space-item {
        font-size: 12px;
      }
      .ant-btn {
        height: 26px;
        line-height: 26px;
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
