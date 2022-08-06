import styled from "styled-components";
import { borderColor, primaryColor, textBodyColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .ant-table-tbody > tr > td,
  .ant-table-thead > tr > th,
  .ant-table tfoot > tr > td,
  .ant-table tfoot > tr > th {
    padding: 10px 5px;
  }
  .ant-card-head-wrapper {
    display: flex;
    justify-content: space-between;
  }
  .ant-card-head-title {
    flex: initial;
  }
  .ant-card-extra {
    .ant-form-item {
      margin-bottom: 0;
    }
  }
  .rowSelectStoreAndProducts {
    .ant-form-item {
      margin-bottom: 20px;
    }
  }
  .ant-table-thead > tr > th {
    white-space: nowrap;
  }
  td.yody-table-discount {
    .saleorder-input-group-wrapper {
      padding: 24px 0 0 0;
    }
  }
  .saleorder-input-group-wrapper {
    .yody-table-discount-converted {
      font-size: 0.857rem;
      text-align: right;
      padding-top: 6px;
    }
  }
  td.saleorder-product-card-action {
    padding: 0 5px !important;
    button {
      border: 1px solid ${borderColor};
      width: 28px;
      height: 28px;
      margin: 2px;
      line-height: 26px;
      background: transparent;
      &:hover {
        border-color: ${primaryColor};
      }
      @media screen and (max-width: 1439px) {
        width: 25px;
        height: 25px;
        line-height: 23px;
      }
    }
  }
  td.yody-pos-name {
    .yody-pos-varian-name {
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .splitOrder {
    display: flex;
    align-items: center;
  }
  .discountGroup {
    .ant-input-group {
      display: flex;
      flex-direction: row-reverse;
      .ant-select:first-child {
        border-radius: 0;
        border-left: none;
        > .ant-select-selector {
          border-color: ${borderColor} !important;
          border-radius: 0;
          border-left: none;
        }
      }
      .ant-select:not(.ant-select-customize-input) .ant-select-selector {
        padding: 0 10px;
      }
    }
  }
  .unit {
    color: #808080;
    margin-left: 6px;
    font-weight: normal;
  }
  .columnHeading {
    &__product {
      text-align: left;
    }
    &__amount {
      text-align: center;
      &-quantity {
        color: ${primaryColor};
      }
    }
    &__inventory {
      text-align: center;
    }
    &__price {
      &-title {
      }
    }
    &__total {
      &-title {
      }
    }
  }
  .columnBody {
    &__product {
      overflow: hidden;
      display: flex;
      flex-direction: column;
      &-inner {
        width: calc(100% - 32px);
        float: left;
      }
      &-gift {
        margin-top: 5px;
        img {
          margin-right: 5px;
        }
      }
    }
    &__amount {
      &-input {
        text-align: right;
        font-weight: 500;
        color: #222;
      }
    }
    &__price {
      &-input {
        text-align: right;
        width: 100%;
        font-weight: 500;
        color: #222;
      }
    }
    &__actions {
      display: flex;
      justify-content: right;
      &-button {
        padding-left: 24px;
        background: transparent;
        border: none;
      }
      &-buttonDropdown {
        border: none !important;
        img {
          width: 17px;
        }
      }
      &-buttonClose {
        background: transparent;
        border: none !important;
        img {
          width: 22px;
        }
      }
    }
  }
  .totalText {
    &__title {
      width: 32%;
      float: left;
      font-weight: bold;
    }
    &__priceAmount {
      width: 27.5%;
      float: left;
      text-align: right;
    }
    &__discountAmount {
      width: 14.5%;
      float: left;
      text-align: right;
    }
    &__orderAmount {
      width: 13.5%;
      float: left;
      text-align: right;
      color: #000;
      font-weight: bold;
    }
  }
  .priceTypeSelect {
    min-width: 145px;
    height: 38px;
  }
  .sale-product-box-table2 {
    input {
      color: ${textBodyColor};
    }
  }
`;
