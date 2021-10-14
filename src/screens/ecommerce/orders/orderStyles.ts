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
    .ant-table.ant-table-middle .ant-table-tbody > tr > td{
        border-right: 1px solid #E5E5E5;
        padding: 10px 10px;
    }

    .ant-table.ant-table-middle .ant-table-tbody > tr > td:first-child{
        border-left: 1px solid #E5E5E5;
    }

    .ant-table.ant-table-middle .ant-table-thead > tr > th {
      border-right: 1px solid #E5E5E5;
    }

    .ant-table.ant-table-middle .ant-table-thead > tr > th:first-child{
      border-left: 1px solid #E5E5E5;
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
    .order-filter {
        .first-line {
            display: flex;
            .ecommerce-dropdown {
                margin-right: 15px;
                margin-bottom: 20px;
                width: 287px;
            }
        }
        .second-line {
            display: flex;
            justify-content: space-between;
            .page-filter {
                padding: 0;
            }
            .id_order_ecommerce {
                width: 170px;
            }
            .input-search {
                width: 380px;
            }
      }
    }
  }

  .render-shop-list {
    .shop-name {
        padding: 5px 10px;
        white-space: nowrap;
        &:hover{
        background-color: #f4f4f7;
        }
        .check-box-name {
        display: flex;
            .name {
                width: 230px;
                overflow: hidden;
                text-overflow: ellipsis;
            }

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
  .ant-form{
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
        .button-option {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          .ant-btn {
            width: 48%;
          }
        }
      }
    }
  }
`;

export const StyledUpdateConnectionModal = styled.div`
  .not-connected-item-list {
    .ant-table.ant-table-middle .ant-table-tbody > tr > td{
      border-right: 1px solid #E5E5E5;
      padding: 10px 10px;
    }

    .ant-table.ant-table-middle .ant-table-tbody > tr > td:first-child{
      border-left: 1px solid #E5E5E5;
    }

    .ant-table.ant-table-middle .ant-table-thead > tr > th {
      border-right: 1px solid #E5E5E5;
    }

    .ant-table.ant-table-middle .ant-table-thead > tr > th:first-child{
      border-left: 1px solid #E5E5E5;
    }
  }
`;
