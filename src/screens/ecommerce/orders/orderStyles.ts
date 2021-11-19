import styled from "styled-components";
import { borderColor } from "utils/global-styles/variables";
export const nameQuantityWidth = 280;
const quantityWidth = 70;
const nameWidth = nameQuantityWidth - quantityWidth;

export const StyledComponent = styled.div`
  .ant-table-cell.product-and-quantity {
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
      padding: 10px 10px;
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
      right: ${quantityWidth}px;
      background-color: ${borderColor};
    }
  }

  .ecommerce-order-list {
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

  .ecommerce-order-filter {
    .order-filter-tags {
      .tag {
        padding: 10px 10px;
        margin-bottom: 20px;
        background: rgba(42, 42, 134, 0.05);
        border-radius: 50px;
      }
    }
  }
`;

export const StyledOrderFilter = styled.div`
  .order-filter {
    overflow-x: scroll;
    .ant-form {
      display: flex;
    }
  }

  .filter-item {
    margin-right: 10px;
  }

  .ecommerce-dropdown {
    margin-right: 10px;
    width: 150px;
    min-width: 150px;
  }

  .select-store-dropdown {
    margin-right: 10px;
    min-width: 180px;
  }

  .search-id-order-ecommerce {
    margin-right: 10px;
    min-width: 180px;
  }

  .search-term-input {
    margin-right: 10px;
    min-width: 180px;
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
