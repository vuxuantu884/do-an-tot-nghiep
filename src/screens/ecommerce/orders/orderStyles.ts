import styled from "styled-components";
import { borderColor } from "utils/global-styles/variables";
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
      right: ${quantityWidth+priceWidth}px;
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
    div:not(:last-child) {
      margin-right: 15px;
    }
    .ant-form {
      display: flex;
      .ant-form-item {
        margin-bottom: 20px;
      }
    }
  }

  .order-filter-tags .tag {
    margin-bottom: 15px;
    padding: 6px 10px;
  }

  .ecommerce-dropdown {
    width: 150px;
    min-width: 150px;
  }

  .select-store-dropdown {
    min-width: 180px;
  }

  .search-id-order-ecommerce {
    min-width: 180px;
    flex-grow: 1;
  }

  .search-term-input {
    min-width: 180px;
    flex-grow: 1;
  }

  .render-shop-list {
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
    width: 110px;
    margin-right: 10px;
    .action-button {
      padding: 6px 15px;
      border-radius: 5px;
      display: flex;
      align-items: center;
      color: $primary-color;
      &:hover {
        color: $primary-color;
        border: 1px solid $primary-color;
        color: $primary-color;
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
      border: 1px solid #e5e5e5;
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
      border-right: 1px solid #e5e5e5;
      padding: 10px 10px;
    }

    .ant-table.ant-table-middle .ant-table-tbody > tr > td:first-child {
      border-left: 1px solid #e5e5e5;
    }

    .ant-table.ant-table-middle .ant-table-thead > tr > th {
      border-right: 1px solid #e5e5e5;
    }

    .ant-table.ant-table-middle .ant-table-thead > tr > th:first-child {
      border-left: 1px solid #e5e5e5;
    }
  }
`;