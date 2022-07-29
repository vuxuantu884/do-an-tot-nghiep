import styled from "styled-components";

export const StyledComponent = styled.div`
  width: 100%;
  .paymentBank {
    .exportBill {
      color: #000;
      margin-top: 12px;
      padding: 6px 0;
    }
    .ant-row {
      align-items: flex-start;
      justify-content: space-between;
    }
  }
  .paymentPoint {
    .ant-row {
      justify-content: space-between;
    }
  }
  .rowPayment {
    margin: 10px 0;
    .ant-col {
      justify-content: space-between;
    }
    &__left {
      /* padding: 0 !important; */
    }
  }
  .rowPaymentLeft__wrapper {
    justify-content: space-between;
  }
  .paymentTitle {
    padding: 8px 0;
  }
  .btn-list-method {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
  .paymentButton {
    display: flex;
    padding: 10px;
  }
  .rowPrice {
    height: 38px;
    margin: 10px 0;
    &__title {
      padding: 8px 0;
    }
    &__amount {
      text-align: right;
    }
  }
  .t-result-blue {
    font-weight: 500;
    font-size: 1.429rem;
  }
  .pointSpendingInput {
    width: 110px;
    margin-left: 12px;
    border-radius: 5px;
  }
  .yody-payment-input {
    text-align: right;
    width: calc(100% - 55px);
  }
  .bankReference {
    margin-left: 12px;
    &__section {
      margin-top: 12px;
    }
  }
  .defaultReference {
    margin-left: 12px;
  }
  .rowLeftAmount {
    &__title {
      margin: 8px 0;
    }
    &__amount {
      text-align: right;
      font-weight: 500;
      font-size: 1.429rem;
    }
  }
  .paymentDetailRight {
    /* padding-left: 20px; */
  }
  .inputMoneyGroup {
    text-align: right;
    .yody-payment-input {
      width: calc(100% - 42px);
    }
  }
  .fillMoneyButton {
    margin-right: 0 !important;
  }
  .iconCheckbox {
    margin-right: 8px;
  }
  .rowPriceAmountWrapper {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 100%;
  }
`;
