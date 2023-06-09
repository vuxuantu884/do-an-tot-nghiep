import styled from "styled-components";

export const StyledComponent = styled.div`
  z-index: 88;
  .disabled-cancel {
    color: rgba(0, 0, 0, 0.25);
    border-color: #d9d9d9;
    background: #f5f5f5;
    text-shadow: none;
    box-shadow: none;
  }
  .order-cod-payment-footer {
    margin-top: 15px;
    border-radius: 5px;
    border: 1px solid #2a2a86;
    height: 54px;
    background-color: #f8f8ff;
    padding: 0 19px;
    display: flex;
    align-items: center;
    & > span {
      size: 14px;
      line-height: 54px;
      letter-spacing: 0.2px;
      color: #2a2a86;
      span {
        font-weight: 500;
      }
    }
    & > div {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 54px;
      height: 54px;
      margin-right: 12px;
      & > div {
        border: 1px solid #2a2a86;
        border-radius: 50%;
        div {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: #2a2a86;
          border: 2px solid white;
          border-radius: 50%;
          img {
          }
        }
      }
    }
  }
  .createPaymentButtons {
    margin-top: 20px;
    button {
      float: right;
      padding: 0 25px;
      margin: 0;
      &:not(:last-child) {
        margin: 0 0 0 10px;
      }
    }
  }
  .updatePayment {
    &__title {
      margin-top: 5px;
      border: none;
    }
  }
  .showCreatePaymentButton {
    &__label {
      margin-top: 20px;
      line-height: 40px;
    }
    &__button {
      float: right;
      padding: 0 25px;
    }
  }
`;
