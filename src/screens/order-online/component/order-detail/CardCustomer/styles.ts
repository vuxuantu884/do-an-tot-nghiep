import styled from "styled-components";

export const StyledComponent = styled.div`
  .cardExtra__content {
    display: flex;
    align-items: center;
    > div {
      &:not(:last-child) {
        margin-right: 10px;
      }
    }
    .ant-form-item {
      margin-bottom: 0;
    }
  }
  .customer-detail-text {
    span {
      color: rgb(252, 175, 23);
      margin-left: 5px;
    }
  }
  .ant-card-body {
    padding-bottom: 30px;
  }
  .boxCustomerInformation {
    padding: 0 24px;
    border-bottom: 1px solid rgb(229, 229, 229);
    &__column {
      padding-top: 14px;
      padding-bottom: 14px;
      &:not(:last-child) {
        border-right: 1px solid rgb(229, 229, 229);
      }
      &-title {
        margin-bottom: 10px;
      }
    }
  }

  .send-order-box {
    padding: 0 24px;
    margin-top: 15px;
    label {
      margin-bottom: 10px;
    }
  }
  .column__title {
    margin-bottom: 10px;
  }
  .title-address {
    img {
      margin-right: 10px;
    }
  }
`;
