import styled from "styled-components";
import {borderColor, primaryColor} from "utils/global-styles/variables";
export const nameQuantityWidth = 300;
const quantityWidth = 50;
const priceWidth = 85;
const nameWidth = nameQuantityWidth - quantityWidth - priceWidth;

export const StyledComponent = styled.div`
  .product-and-quantity {
    padding: 0 !important;
  }

  .product-and-quantity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .product-name {
      width: ${nameWidth}px;
      text-align: center;
    }

    .item-price {
      align-items: center;
    }
  }

  .item-custom-td {
    height: 100%;
    display: flex;
    justify-content: space-between;
    &:not(:last-child) {
      border-bottom: 1px solid ${borderColor};
    }

    .product {
      width: ${nameWidth}px;
      padding: 10px;
    }
  }

  .quantity {
    width: ${quantityWidth}px;
    white-space: nowrap;
    display: flex;
    align-items: center;
    justify-content: center;
    &:before {
      content: "";
      display: block;
      width: 1px;
      position: absolute;
      z-index: 1;
      top: 0;
      bottom: 0;
      right: ${quantityWidth + priceWidth}px;
      background-color: ${borderColor};
    }
  }

  .item-price {
    width: ${priceWidth}px;
    padding: 10px;
    align-items: flex-end;
    display: flex;
    flex-direction: column;
    justify-content: center;
    &:before {
      content: "";
      display: block;
      width: 1px;
      position: absolute;
      z-index: 1;
      top: 0;
      bottom: 0;
      right: ${priceWidth}px;
      background-color: ${borderColor};
    }
  }

  .ecommerce-order-list {
    .cell-items {
      margin: 0 -10px;
      .item {
        width: 100%;
        border-bottom: 1px solid #f4f4f7;
        padding: 10px;
      }
      .item:last-child {
        border-bottom: none;
      }
      .tooltip-item {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
`;

export const StyledOrderFilter = styled.div`
  .order-filter {
    overflow-x: auto;
    margin-bottom: 5px;
    .ant-form {
      display: flex;
      .ant-form-item {
        margin-bottom: 5px;
      }
    }
  }

  .order-filter-tags .tag {
    margin-bottom: 10px;
    margin-top: 0;
    padding: 5px 10px;
  }

  .ecommerce-dropdown {
    width: 160px;
    min-width: 140px;
    margin-right: 10px;
    .ant-select-selector {
      padding: 0 10px;
      .ant-select-selection-item {
        display: flex;
        align-items: center;
      }
    }
  }

  .select-store-dropdown {
    min-width: 160px;
    width: 250px;
    margin-right: 10px;
    .ant-select-selection-overflow-item-suffix {
      width: 30px;
    }
  }

  .search-id-order-ecommerce {
    min-width: 160px;
    flex-grow: 1;
    margin-right: 10px;
  }

  .search-term-input {
    min-width: 170px;
    flex-grow: 1;
    margin-right: 10px;
  }

  .select-sub-status {
    min-width: 130px;
    width: 200px;
    margin-right: 10px;
  }
  
  .setting-button {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .render-shop-list {
    max-height: 160px;
    overflow-x: hidden;
    overflow-y: scroll;
    .shop-name {
      padding: 5px 10px;
      white-space: nowrap;
      &:hover {
        background-color: #f4f4f7;
      }
      .check-box-name {
        display: flex;
        .name {
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }

  .action-dropdown {
    width: 100px;
    margin-right: 10px;
    .action-button {
      width: 100%;
      padding: 10px;
      border-radius: 5px;
      display: flex;
      align-items: center;
      color: ${primaryColor};
      &:hover {
        border: 1px solid ${primaryColor};
      }
    }
  }
`;

export const StyledDownloadOrderData = styled.div`
  .ecommerce-list {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;

    .ant-btn {
      padding: 7px 10px;
      display: flex;
      align-items: center;
      background-color: #ffffff;
      border: 1px solid ${borderColor};
      img {
        margin-right: 10px;
      }
    }

    .active-button {
      background-color: #f3f3ff;
      color: #222222;
    }

    .icon-active-button {
      margin-left: 5px;
      margin-right: 0 !important;
    }
  }
`;

export const StyledEcommerceOrderBaseFilter = styled.div`
  .ant-form {
    .ant-row {
      .ant-collapse-content-box {
        .date-option {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          .ant-btn {
            width: 30%;
          }
        }
      }
    }
  }

  .total-price {
    display: flex;
    justify-content: center;
    border: 1px solid #d9d9d9;
    border-radius: 5px;
    padding: 15px;
    .ant-form-item {
      margin: 0;
    }
    .ant-input-number {
      width: 100%;
    }
    .site-input-split {
      width: 10%;
      border: 0;
      pointer-events: none;
    }
  }
`;

export const StyledUpdateConnectionModal = styled.div`
  .not-connected-item-list {
    .ant-table.ant-table-middle .ant-table-tbody > tr > td {
      border-right: 1px solid ${borderColor};
      padding: 10px 10px;
    }

    .ant-table.ant-table-middle .ant-table-tbody > tr > td:first-child {
      border-left: 1px solid ${borderColor};
    }

    .ant-table.ant-table-middle .ant-table-thead > tr > th {
      border-right: 1px solid ${borderColor};
    }

    .ant-table.ant-table-middle .ant-table-thead > tr > th:first-child {
      border-left: 1px solid ${borderColor};
    }
  }
`;

export const StyledLogisticConfirmModal = styled.div`
  .ant-modal-content{
    
  }
`;
