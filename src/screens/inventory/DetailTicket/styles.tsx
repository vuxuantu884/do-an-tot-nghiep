import styled from "styled-components";
import { borderColor } from "utils/global-styles/variables";
import { STATUS_INVENTORY_TRANSFER } from "../constants";
import { BG_COLOR_TAG } from "../ListTicket/ListTicketTab/InventoryTransfer/styles";

export const StyledWrapper = styled.div`
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

    .border-red {
      border-color: #FF0000 !important;
    }

    .border-violet {
      border-color: #EE82EEFF !important;
    }

    .border-orange {
      border-color: yellow !important;
    }
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
    
    .ant-row {
      margin-bottom: 0 !important;
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
        gap: 20px !important;

        a {
          color: #2A2A86;
        }

        a > span {
          margin-right: 5px;
        }
      }
    }
  }

  .inventory-transfer-action {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;

    & .button-draft {
      margin-right: 20px;
    }

    & .export-button {
      background-color: unset;
      color: #2a2a86;
      margin-left: 20px;

      &:hover {
        background-color: #2a2a86;
        color: #fff;
      }
    }
  }

  .ant-table-summary > tr > td, .ant-table-summary > tr > th {
    border-bottom: none;
  }

  .inventory-transfer-table, .inventory-info {
    .status {
      padding: 2px 8px;
      border-radius: 20px;

      .${STATUS_INVENTORY_TRANSFER.TRANSFERRING.status} {
        color: ${BG_COLOR_TAG.TRANSFERRING.color};
      }
      .${STATUS_INVENTORY_TRANSFER.PENDING.status} {
        color: ${BG_COLOR_TAG.PENDING.color};
      }
      .${STATUS_INVENTORY_TRANSFER.RECEIVED.status} {
        color: ${BG_COLOR_TAG.RECEIVED.color};
      }
      .${STATUS_INVENTORY_TRANSFER.CANCELED.status} {
        color: ${BG_COLOR_TAG.CANCELED.color};
      }
      .${STATUS_INVENTORY_TRANSFER.CONFIRM.status} {
        color: ${BG_COLOR_TAG.CONFIRM.color};
      }
    }
  }

  .shipment {
    align-items: center;

    &-logo {
      width: 110px;
      margin-right: 20px;

      img {
        width: 100%;
      }
    }

    &-detail {
      & > span {
        color: #2A2A86;
        margin-left: 5px;
        width: 20px;
      }
    }
  }

  .timeline-collapse {
    border: unset;
    width: 100%;
    background-color: #fff;

    .ant-collapse-content {
      border: unset;
    }

    .ant-collapse-item {
      border: unset;

      & .ant-collapse-header {
        position: absolute;
        right: 30px;
        z-index: 2;
      }
    }

    .ant-timeline-item-content {
      min-height: unset;
      top: -7px;

      & > span, span {
        padding: 0 10px;
      }
    }

    .ant-timeline-item-head-blue {
      background: ${borderColor};
      border: none;
    }
  }
  .ant-table-thead > tr > th, .ant-table-tbody >tr>td {
    padding: 5px 0 !important;
  }
  .checkbox {
    margin-right: 20px;
  }
  
  .ant-btn {
    display: flex;
    align-items: center;
  }
  
  .button-save {
    display: flex;
    justify-content: right;
    margin-top: 10px;
  }
  
  .display-flex {
    display: flex;
  }
  
  .align-item-center {
    align-items: center;
  }
  
  .ant-collapse-header {
    display: flex;
    align-items: center;
  }

  .ant-collapse>.ant-collapse-item {
    border-bottom: none;
  }

  .ant-collapse, .ant-collapse>.ant-collapse-item>.ant-collapse-header {
    border: none;
    background-color: #FFFFFF;
  }

  .ant-collapse-content {
    border: none;
  }
  
  .text-danger {
    color: #ff0000;
  }

  .text-normal {
    color: #2a2a86;
  }

  .ant-collapse-content>.ant-collapse-content-box {
    padding: 0 16px;
  }

  .ant-steps-dot .ant-steps-item-tail:after, .ant-steps-dot.ant-steps-small .ant-steps-item-tail:after {
    height: 1px !important;
  }
  
  .step {
    .ant-steps-icon-dot {
      height: 50%;
      width: 50%;
    }

    .ant-steps-item-finish .ant-steps-item-tail {
      top: 3px !important;
      width: 110%;
      left: -10px;
    }
    
    .ant-steps-item-title {
      color: #222222 !important;
      font-size: 14px;
    }
    
    .ant-steps-item-description {
      font-size: 14px;
    }

    .ant-steps-item-finish .ant-steps-item-tail::after {
      background-color: #E5E5E5 !important;
    }
  }
  .ant-collapse>.ant-collapse-item>.ant-collapse-header .ant-collapse-arrow {
    color: #2a2a86;
    font-size: 14px;
    font-weight: 500;
  }
`;
