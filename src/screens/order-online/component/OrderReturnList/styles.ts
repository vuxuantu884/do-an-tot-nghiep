import styled from "styled-components";
import {
  borderColor,
  dangerColor,
  primaryColor,
  textBodyColor,
  yellowColor,
} from "utils/global-styles/variables";
let nameQuantityWidth = 200;
export const StyledComponent = styled.div`
  .actionButton {
    &:not(:last-child) {
      margin-bottom: 5px;
    }
    margin-left: -0.9px;
  }
  .orderSource {
    margin-bottom: 9px;
    margin-left: -1.7px;
  }
  .order-options {
    border-bottom: 1px solid #5252;
    .ant-radio-group {
      .ant-radio-button-wrapper {
        border-style: none;
        border-width: 0;
        box-shadow: none;
        height: auto;
        padding: 11px 0;
        margin: 0 0 0 32px;
        &:first-child {
          margin-left: 0;
        }
      }
      .ant-radio-button-wrapper:first-child {
        border-left: none;
        border-radius: none;
      }
      .ant-radio-button-wrapper:not(:first-child):before {
        width: 0;
      }
      .ant-radio-button-wrapper-checked {
        color: #2a2a86;
        border-bottom: 2px solid #2a2a86;
      }
    }
  }
  .page-filter {
    padding-top: 0;
  }
  .order-list {
    .productNameQuantityPrice {
      width: ${nameQuantityWidth}px;
      padding: 5px 0px !important;
    }
    // .productNameQuantityPriceHeader {
    //   > span {
    //     padding: 12px 10px !important;
    //   }
    // }
    .productNameQuantityPriceHeader {
      display: flex;
      justify-content: space-between;
    }
    .productNameWidth {
      width: 60%;
    }

    th {
      /* text-align: center !important; */
      padding: 12px 10px !important;
      justify-content: center !important;
      .separator {
        display: none;
      }
    }

    .quantityWidth {
      width: 15%;
      text-align: center;
    }
    .price {
      white-space: nowrap;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      &:before {
        // content: "";
        display: block;
        width: 1px;
        position: absolute;
        z-index: 1;
        top: -999px;
        bottom: -999px;
        left: 0;
        background-color: ${borderColor};
      }
    }
    .priceWidth {
      width: 25%;
      text-align: center;
      justify-content: center;
      padding: 0 10px;
    }
    .text-center {
      text-align: center;
      .icon-partial {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border-color: #2a2a86;
        border-width: 1px;
        border-style: solid;
        background-image: linear-gradient(to right, #2a2a86 50%, #ffffff 50%);
      }
      .icon-full {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border-color: #2a2a86;
        border-width: 1px;
        border-style: solid;
        background-color: #2a2a86;
      }
      .icon-blank {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border-color: #2a2a86;
        border-width: 1px;
        border-style: solid;
        background-color: #ffffff;
      }
    }

    .text-left {
      text-align: left;
    }

    .item.custom-td {
      height: 100%;
      display: flex;
      justify-content: space-between;
      &:not(:last-child) {
        border-bottom: 1px solid ${borderColor};
      }
      .product {
        padding: 10px 10px;
        height: 100%;
        display: flex;
        align-items: center;
        a {
          font-weight: 500;
        }
      }
      p {
        margin-bottom: 0;
      }
      .quantity,
      .priceWidth {
        white-space: nowrap;
        display: flex;
        align-items: center;
        position: relative;
        &:before {
          content: "";
          display: block;
          width: 1px;
          position: absolute;
          z-index: 1;
          top: -999px;
          bottom: -999px;
          left: 0;
          background-color: ${borderColor};
        }
      }
      .quantity {
        justify-content: center;
      }
      .price {
        white-space: nowrap;
        display: flex;
        align-items: center;
        justify-content: center;
        &:before {
          // content: "";
          display: block;
          width: 1px;
          position: absolute;
          z-index: 1;
          top: -999px;
          bottom: -999px;
          left: 0;
          background-color: ${borderColor};
        }
      }
      .productNameText {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }
    .customer {
      .ant-btn {
        line-height: 15px;
        height: 15px;
        width: auto;
      }
    }
  }
  .orderId {
    .noWrap {
      white-space: nowrap;
      .order-id-title {
        font-weight: 500;
      }
    }
    .single {
      margin-top: 2px;
    }
    .single-lg {
      margin-top: 10px;
    }
  }

  .total-amount {
    &-black {
      font-weight: 600;
      color: #222222;
    }
    .item-discount {
      color: #e24343;
    }
  }

  .point-refund,
  .card-refund {
    .item-point {
      color: #fcaf17;
      font-weight: 600;
      padding-left: 5px;
    }
    .item-card {
      color: #222222;
      font-weight: 600;
      padding-left: 5px;
    }
    span.item-tooltip {
      display: block;
      img {
        padding-bottom: 2px;
      }
    }
  }

  .received {
    &-success {
      color: #27ae60;
      font-weight: 600;
    }
    &-danger {
      color: #e24343;
      font-weight: 600;
    }
  }

  .refund-amount {
    &-success {
      color: #27ae60;
      font-weight: 600;
    }
    &-danger {
      color: #e24343;
      font-weight: 600;
    }
    &-warning {
      color: #fcaf17;
      font-weight: 600;
    }
  }

  .code_order_return {
    .noWrap {
      white-space: nowrap;
    }
    .single {
      margin-top: 2px;
    }
  }
  .textSmall {
    font-size: 0.86em;
    line-height: 1.25;
  }
  .mainColor {
    color: ${primaryColor};
  }
  .pointRefund {
    img {
      position: relative;
      top: -1px;
      margin-right: 5px;
    }
    .number {
      font-weight: 500;
      color: ${yellowColor};
    }
  }
  .orderNotes {
    .inner {
      height: 100%;
    }
    .single {
      height: 50%;
      display: flex;
      padding: 10px 10px;
      align-items: center;
      &:not(:last-child) {
        border-bottom: 1px solid ${borderColor};
      }
      .wrapper {
        display: flex;
      }
      svg {
        position: relative;
        top: 3px;
      }
    }
  }
  .item-title {
    color: ${textBodyColor};
    font-weight: 500;
  }
  .orderReturnCode {
    font-weight: 500;
  }
  .orderOriginCode {
    font-weight: 500;
  }
  .exportIcon {
    img {
      margin-right: 8px;
    }
  }
  .itemDiscount {
    color: ${dangerColor};
  }
  .promotionText {
    color: rgb(42, 42, 134);
    font-size: 0.93rem;
    font-weight: 500;
    margin-right: 3px;
    font-style: italic;
  }
  .iconGift {
    margin-right: 3px;
    position: relative;
    margin-top: -3px;
  }
`;
