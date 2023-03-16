import styled from "styled-components";
import { STATUS_INVENTORY_ADJUSTMENT } from "../ListInventoryAdjustment/constants";
import { BG_COLOR_TAG } from "../ListInventoryAdjustment/InventoryAdjustment/styles";

export const StyledWrapper = styled.div`
  position: relative;

  .container-file-pin {
    display: flex;
    align-items: center;
    .file-pin {
      display: inline-block;
      white-space: nowrap;
      overflow: hidden;
      width: 90%;
      text-overflow: ellipsis;
    }

    .mr-5 {
      margin-right: 5px;
    }
    
    .input-editable {
      border: none;
      outline: none;
      padding: 0;
      width: 90%;
      line-height: 20px;
      height: 20px;
    }
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
    width: 40px;
    height: 40px;
    border-radius: 3px;
    background-color: #f2f2f2;
    img {
      max-width: 40px;
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
        gap: 0 !important;

        a {
          color: #2a2a86;
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
  .ant-table-summary > tr > td,
  .ant-table-summary > tr > th {
    border-bottom: none;
  }

  .inventory-adjustment-table,
  .inventory-info {
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
        color: #2a2a86;
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
  .audit_by {
    font-weight: 500;
  }
  .row-detail {
    margin-bottom: 15px;
    font-size: 14px;
    width: 100%;
    .label {
      color: #666666;
    }
    .dot {
      float: right;
      margin-right: 10px;
    }
    .data {
      color: #222222;
      font-weight: 500;
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
  .detail-info {
    background: #ffffff;
    border-radius: 4px;
    padding: 10px;
    margin: 10px 0 !important;
    
    .ant-row {
      flex-wrap: unset !important;
    }
  }
  .icon {
    position: absolute;
    top: 10px;
    right: 10px;
  }
  .label {
    position: relative;
    line-height: 20px;
    border-radius: 4px;
    color: #ffffff;
    padding: 10px 18px;
  }
  .label-green {
    background-color: #27ae60;
  }
  .label-red {
    background-color: #e24343;
  }
  .custom-table .ant-table.ant-table-middle .ant-table-thead > tr > th,
  .custom-table .ant-table.ant-table-middle .ant-table-tbody > tr > td {
    padding: 6px !important;
  }

  .btn-report {
    height: 42px;
    color: #fcaf17;
    border: 1px solid #fcaf17 !important;
    margin-right: 12px;
  }

  .icon-report {
    margin-right: 8.64px;
  }

  .ant-radio-button-wrapper {
    padding: 0 5px !important;
  }
  .custom-group-btn {
    padding: 0 2px !important;
  }
  .number-text {
    color: #5656a2;
  }
  
  .ant-table-sticky-holder {
    top: 56px !important;
  }
  
  .adjustment-inventory-table {
    th, td {
      padding: 5px !important;
    }
  }
`;

export const StyledWrapperContentModal = styled.div`
  .adjustment-inventory-table {
    th, td {
      padding: 5px;
    }
  }
  .warning {
    display: flex;
    flex-direction: row;
    justify-content: start;
    align-items: center;
    padding: 9px 16px;
    background: #FFFBE6;
    border: 1px solid #FFE58F;
    border-radius: 2px;
  }
  .icon-warning {
    margin-right: 10px;
    color: #FAAD14;
    font-size: 20px;
  }
  .table-group {
    display: flex;
  }
`

export const StyledWrapperFooterModal = styled.div`
  .group-btn {
    display: flex;
    align-items: center;

    .btn-show-tour {
      margin-right: auto;
      border-color: #FAAD14;
    }
  }
`