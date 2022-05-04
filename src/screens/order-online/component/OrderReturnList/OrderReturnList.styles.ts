
import styled from "styled-components";
import { borderColor } from "utils/global-styles/variables";
let nameQuantityWidth = 200;
export const StyledComponent = styled.div`
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
  .order-list{
    .productNameQuantityPrice {
      width: ${nameQuantityWidth}px;
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
      width: 60% ;
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
        bottom:-999px;
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
          bottom:-999px;
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
  }
`;
