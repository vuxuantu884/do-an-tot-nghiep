import styled from "styled-components";
import { borderColor } from "utils/global-styles/variables";

const DetailStyle = styled.div`
  .order-list {
    .empty-view {
      display: flex;
      flex-direction: column;
      align-content: "center";
      img {
        height: 100px;
      }
      .ant-btn {
        width: 40%;
        align-self: center;
      }
    }
    th {
      text-align: center !important;
    }

    .fulfillment-small {
      color: #ff5630;
      font-size: 12px;
      font-style: italic;
    }
    .status-color {
      color: #28a745 !important;
      font-weight: 500;
    }
    .product-name-ellipsis {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .ant-table-cell.customer-column,
    .ant-table-cell.products {
      padding: 0px 0px !important;
      .row-item {
        height: 100%;
        padding: 10px;
        display: flex;
        justify-content: space-between;
        &:not(:last-child) {
          border-bottom: 1px solid ${borderColor};
        }
      }
    }
    .center {
      flex-direction: column;
      align-items: center;
    }
    .page-filter {
      &-left {
        margin-right: 20px;
      }
      .input-search {
        margin-right: 10px;
      }
    }
  }
  .row-product-item {
    margin-bottom: 10px;
    .row-sku {
      display: flex;
      flex-direction: row;
      .sku {
        font-weight: 500;
        color: black;
      }
      .quantity {
        font-weight: 500;
        color: red;
      }
    }
  }
`;

export { DetailStyle };
