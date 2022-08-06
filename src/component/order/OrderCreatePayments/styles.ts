import styled from "styled-components";
import { yellowColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .order-cod-payment-footer {
    margin-top: 15px;
    border-radius: 5px;
    border: 1px solid #2a2a86;
    background-color: #f8f8ff;
    padding: 0 19px;
    display: flex;
    align-items: center;
    font-weight: 500;
    letter-spacing: 0.2px;
    color: #2a2a86;
    .selfDeliverContent,
    .deliverLaterContent {
      padding: 16px 0;
    }
    .pickAtStoreContent {
      height: 83px;
      width: 100%;
      display: flex;
      align-items: center;
      & > div {
        display: flex;
        align-items: center;
        width: 54px;
        height: 54px;
        margin-right: 12px;
        & > div {
          border: 1px solid #2a2a86;
          border-radius: 100%;
          div {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
            background: #2a2a86;
            border: 2px solid white;
            border-radius: 100%;
            img {
            }
          }
        }
      }
      &__icon {
        margin-right: 12px;
      }
    }
  }
  .formItemCreatePayment {
    margin-bottom: 0;
  }
  .rowPrePayment {
    margin-top: 18px;
    &__inner {
      padding: 0 24px;
      max-width: 100%;
    }
    &__header {
      text-transform: uppercase;
      font-weight: 500;
      color: #222;
      padding: 6px;
    }
    &__content {
      width: 1200px;
      max-width: 100%;
    }
  }
  .amountTitle {
    margin-right: 20px;
  }
  .divider {
    margin: 10px 0;
  }
  .change {
    color: ${yellowColor};
  }
`;
