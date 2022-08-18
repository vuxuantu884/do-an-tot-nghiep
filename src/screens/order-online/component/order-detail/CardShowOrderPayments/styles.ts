import styled from "styled-components";
import {
  borderRadius,
  dangerColor,
  textBodyColor,
  yellowColor,
} from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .orders-tag {
    margin-left: 10px;
  }
  .momoButton {
    margin-top: 15px;
    height: 28px;
    line-height: 28px;
    padding: 0 15px;
    border-radius: ${borderRadius};
    &:not(:last-child) {
      margin-right: 5px;
    }
  }
  .paymentMethod {
    max-width: 80%;
  }
  .ant-collapse-header {
    padding-right: 0 !important;
  }
  .momoShortLink {
    max-width: 85%;
    a {
      &:hover {
        text-decoration: underline;
      }
    }
  }
  .paymentTitle {
    font-weight: bold;
    a {
      font-weight: normal;
      word-break: break-all;
    }
  }
  .momoReference {
    font-weight: normal;
    word-break: break-all;
  }
  .paymentDetailTop {
    margin-bottom: 20px;
    .leftMoney {
      color: ${dangerColor};
    }
    .change {
      color: ${yellowColor};
    }
  }
  .paymentReference {
    margin: 0;
  }
  .paymentPointNumber {
    margin-left: 10px;
  }
  .paidTag {
    background-color: rgba(39, 174, 96, 0.1);
    color: #27ae60;
  }
  .paymentDetailMain {
    padding: 0 0 0 15px;
  }
  .paymentPartial {
    &__header {
      padding-left: 14px;
      color: ${textBodyColor};
      text-transform: uppercase;
    }
  }
  .divider {
    margin: 10px 0;
  }
  .buttonShowPartialPayment {
    margin-top: 10px;
  }
`;
