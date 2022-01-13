import styled from "styled-components";
import { STATUS_INVENTORY_ADJUSTMENT } from "../ListInventoryAdjustment/constants";
import { BG_COLOR_TAG } from "../ListInventoryAdjustment/InventoryAdjustment/styles";

export const StyledWrapper = styled.div`
  position: relative;

  .file-pin {
    display: inline-block;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span.ant-tag {
    padding: 2px 8px;
    border-radius: 20px;
    margin: 0;
  }

  .ant-card-body {
    padding: 10px 20px;
  }

  .ant-card-head {
    padding: 10px 20px;
  }

  .ant-card {
    &.product-detail {
      margin-top: 20px;
    }
  }
  .inventory-table {
    margin-top: 20px;
  }
  
  .inventory-info {
    .ant-card-body {
      padding: 10px;
    }
  }
  
  .inventory-note {
    .ant-card-body {
      padding: 10px 20px;
    }
  }

  .sum-qty {
    display: flex;
    justify-content: end;
    align-items: center;
    margin-top: 20px;
    & b {
      margin-right: 140px;
    }
    & span {
      margin-right: 100px;
    }
  }

  .product-item-image {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 40px;
    border-radius: 3px;
    background-color: #f2f2f2;
    img {
      max-width: 30px;
      max-height: 40px;
      border-radius: 3px;
    }
  }

  .ant-row.detail-footer-table {
    width: 100%;
    text-align: right;
    margin-top: 20px;
  }

  .bottom {
    &__right {
      .ant-space-align-center {
        gap: 20px!important;

        a {
          color: #2A2A86;
        }

        a > span {
          margin-right: 5px;
        }
      }
    }
  }

  .inventory-adjustment-action {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;

    & .button-draft {
      margin-right: 20px;
    }
  }
  .ant-table-summary {
    display: table-header-group;
  }
  .ant-table-summary>tr>td, .ant-table-summary>tr>th {
    border-bottom: none;
  }

  .inventory-adjustment-table, .inventory-info {
    .ant-tag {
      padding: 2px 8px;
      border-radius: 20px;
  
      &.${STATUS_INVENTORY_ADJUSTMENT.ADJUSTED.status} {
        background: ${BG_COLOR_TAG.ADJUSTED.background};
        color: ${BG_COLOR_TAG.ADJUSTED.color};
      }
      &.${STATUS_INVENTORY_ADJUSTMENT.AUDITED.status} {
        background: ${BG_COLOR_TAG.AUDITED.background};
        color: ${BG_COLOR_TAG.AUDITED.color};
      }
      &.${STATUS_INVENTORY_ADJUSTMENT.DRAFT.status} {
        background: ${BG_COLOR_TAG.DRAFT.background};
        color: ${BG_COLOR_TAG.DRAFT.color};
      }
    }
  }

  .shipment {
    align-items: center;
    &-logo {
      width: 200px;
      margin-right: 20px;
      img {
        width: 100%;
      }
    }
    &-detail {
      & > span {
        color: #2A2A86;
        font-size: 18px;
        margin-left: 5px;
        width: 20px;
      }
    }
  }

  .ant-card-body {
    padding: 0 20px;
    padding-bottom: 20px;
  }
  .ant-tabs-nav {
    padding: 0;
  }
  .ant-tabs-tab {
    padding: 16px 0;
  }

  .pd16 {
    padding: 16px 0 16px 0;
  }
  .audit_by{
    font-weight: 500;
  }
  .row-detail {
    margin-bottom: 15px;
    font-size: 14px;
    width: 100%; 
    .label {
      color: #666666;
    } 
    .dot{
      float: right;
      margin-right: 10px;
    }
    .data {
      color: #222222;
      font-weight:500;
    }
    .item-delete {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: transparent;
      border: none;
      color: #222222;
      box-shadow: none;
      &:hover {
        background-color: rgba($primary-color, 0.15);
      }
  }
  }
`;
