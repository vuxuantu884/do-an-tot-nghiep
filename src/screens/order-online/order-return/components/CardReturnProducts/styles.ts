import styled from "styled-components";
import { dangerColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .ant-card-body {
    padding: 24px;
  }
  .label {
    margin-bottom: 15px;
  }
  .returnAllCheckbox {
    margin-left: 20px;
  }
  .productSearchInput {
    width: 100%;
    margin-bottom: 15px;
  }
  .ant-select-item {
    height: auto;
  }
  .boxPayment {
    padding-top: 20px;
    .ant-row {
      &:not(:last-child) {
        margin-bottom: 10px;
      }
    }
  }
  .columnQuantity {
    text-align: center;
  }
  .ant-table-tbody > tr > td {
    padding: 8px;
  }
  .yody-pos-varian-name {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .popOverPrice {
    &__title {
      display: flex;
      justify-content: space-between;
      p {
        margin-bottom: 0;
      }
      &-price {
        margin-left: 20px;
      }
    }
  }
  .popOverPriceContent {
    display: flex;
    justify-content: space-between;
    &:not(:last-child) {
      margin-bottom: 10px;
    }
    p {
      margin-bottom: 0;
    }
  }
  .currencyUnit {
    color: #808080;
    margin-left: 6px;
    font-weight: normal;
  }
  .columnHeading {
    &__quantity {
      text-align: center;
    }
    &__price {
      &-title {
        text-align: right;
      }
    }
    &__total {
      &-title {
        text-align: right;
      }
    }
  }
  .columnBody {
    &__quantity {
      &-numberInput {
        width: 100px;
      }
    }
    &__variant {
      &-inner {
        width: calc(100% - 32px);
        float: left;
      }
    }
    &__delete {
      padding-left: 24px;
      background: transparent;
      border: none;
      color: ${dangerColor};
      img {
        margin-right: 5px;
      }
    }
  }
  .tableEmpty__button {
    background: rgba(42, 42, 134, 0.05);
  }
  .yody-search {
    .anticon-search {
      color: #abb4bd;
    }
  }
`;
