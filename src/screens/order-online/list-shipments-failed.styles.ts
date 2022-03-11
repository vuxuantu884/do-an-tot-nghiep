import styled from "styled-components";
import { borderColor } from "utils/global-styles/variables";
const quantityWidth = 80;

export const StyledComponent = styled.div`
  .ant-card-body {
    padding-top: 0;
  }
  th {
    .productNameQuantityHeader {
      .productNameWidth {
        text-align: center;
      }
    }
  }
  .ant-table-cell.productNameQuantity {
    padding: 0 !important;
  }
  td {
    position: relative;
  }
  .productNameQuantityHeader {
    display: flex;
    justify-content: space-between;
  }
  .productNameWidth {
    width: 200px;
  }
  .quantityWidth {
    width: ${quantityWidth}px;
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
    .quantity {
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
  }
  .code {
    .order {
      .title {
        font-weight: 500;
      }
    }
    .order-time {
      padding-left: 38px;
      color: #666666;
      font-size: 12px;
      font-weight: 400;
    }
    .tracking {
      .title {
        font-weight: 500;
        width: 50px;
      }
    }
  }
  .shipment-details {
    .label {
      color: #666666;
      font-weight: 400;
    }
    .value {
      color: #222222;
      font-weight: 500;
    }
    > * {
      margin-bottom: 5px;
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
`;
