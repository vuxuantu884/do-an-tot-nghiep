import styled from "styled-components";
import { borderColor } from "utils/global-styles/variables";



export const nameQuantityWidth = 280;
const quantityWidth = 60;
const massWidth=100;
const priceWidth = 100;
const nameWidth = nameQuantityWidth - quantityWidth;

export const StyledComponent = styled.div`
  .bottomBar {
    position: fixed;
    text-align: right;
    left: ${240 + 20}px;
    padding: 5px 10px;
    bottom: 0%;
    background-color: #fff;
    margin-left: -20px;
    margin-top: 10px;
    right: 0;
    z-index: 99;
    transition: all 0.2s;
  }
  th {
		text-align: center !important;
  }
  .ant-table-cell.customer-column,
  .ant-table-cell.productNameQuantity {
    padding: 0 10px !important;
  }
  td {
    position: relative;
  }
  .productNameQuantityHeader {
    display: flex;
    justify-content: space-between;
  }
  .productNameWidth {
    width: ${nameWidth}px;
  }
  .quantityWidth {
    width: ${quantityWidth}px;
    text-align: center;
  }
  .massWidth{
    width: ${massWidth}px;
    text-align: center;
  }
  .priceWidth {
    width: ${priceWidth}px;
    text-align: center;
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
      justify-content: center;
      position:relative;
      &:before {
        content: "";
        display: block;
        width: 1px;
        position: absolute;
        z-index: 1;
        top: -999px;
        bottom: -999px;
        right: ${quantityWidth}px;
        background-color: ${borderColor};
      }
    }
    .mass{
      white-space: nowrap;
      display: flex;
      align-items: center;
      justify-content: center;
      position:relative;
      &:before {
        content: "";
        display: block;
        width: 1px;
        position: absolute;
        z-index: 1;
        top: 0px;
        bottom: 0px;
        right: ${massWidth}px;
        background-color: ${borderColor};
      }
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
        right: ${priceWidth}px;
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
`;
