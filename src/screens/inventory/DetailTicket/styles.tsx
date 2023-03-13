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

  .ant-card {
    &.product-detail {
      margin-top: 20px;
    }
  }

  .inventory-table {
    margin-top: 20px;

    .border-red {
      border-color: #ff0000 !important;
    }

    .border-violet {
      border-color: #ee82eeff !important;
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
    width: 40px !important;
    height: 40px !important;
    min-width: 40px;
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
        gap: 20px !important;

        a {
          color: #2a2a86;
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

  .ant-table-summary > tr > td,
  .ant-table-summary > tr > th {
    border-bottom: none;
  }

  .inventory-transfer-table,
  .inventory-info {
    .status {
      border-radius: 2px;

      .${STATUS_INVENTORY_TRANSFER.TRANSFERRING.status} {
        color: ${BG_COLOR_TAG.TRANSFERRING.color};
        background: ${BG_COLOR_TAG.TRANSFERRING.background};
        border: 1px solid ${BG_COLOR_TAG.TRANSFERRING.color};
        padding: 4px 8px;
      }
      .${STATUS_INVENTORY_TRANSFER.PENDING.status} {
        color: ${BG_COLOR_TAG.PENDING.color};
        background: ${BG_COLOR_TAG.PENDING.background};
        border: 1px solid ${BG_COLOR_TAG.PENDING.color};
        padding: 4px 8px;
      }
      .${STATUS_INVENTORY_TRANSFER.RECEIVED.status} {
        color: ${BG_COLOR_TAG.RECEIVED.color};
        background: ${BG_COLOR_TAG.RECEIVED.background};
        border: 1px solid ${BG_COLOR_TAG.RECEIVED.color};
        padding: 4px 8px;
      }
      .${STATUS_INVENTORY_TRANSFER.CANCELED.status} {
        color: ${BG_COLOR_TAG.CANCELED.color};
        background: ${BG_COLOR_TAG.CANCELED.background};
        border: 1px solid ${BG_COLOR_TAG.CANCELED.color};
        padding: 4px 8px;
      }
      .${STATUS_INVENTORY_TRANSFER.CONFIRM.status} {
        color: ${BG_COLOR_TAG.CONFIRM.color};
        background: ${BG_COLOR_TAG.CONFIRM.background};
        border: 1px solid ${BG_COLOR_TAG.CONFIRM.color};
        padding: 4px 8px;
      }

      .mr-5 {
        margin-right: 5px;
      }
    }
  }
  
  .tag-receive-all {
    margin-left: 15px;
    text-transform: none !important;
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

  .timeline-collapse {
    margin-top: 30px;
    border: unset;
    width: 100%;
    min-height: 100px;
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

    .ant-timeline-item-last > .ant-timeline-item-content {
      min-height: unset;
      top: -3px;

      & > span {
        padding: 0 10px;
      }
    }

    .ant-timeline-item-head-blue {
      background: ${borderColor};
      border: none;
    }
  }
  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td {
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

  .ant-steps-dot .ant-steps-item-tail:after, .ant-steps-dot.ant-steps-small .ant-steps-item-tail:after {
    height: 1px !important;
  }
  
  .text-gray {
    color: #8C8C8C;
  }
  
  .fs-12 {
    font-size: 12px;
  }
  
  .ant-table-measure-row {
    display: none;
  }
  
  .ant-table-thead > tr > th {
    background: #FAFAFA;
  }

  .ant-table-thead > tr > th {
    border-bottom: 1px solid #e5e5e5;
  }
  
  .ant-table-tbody > tr > td {
    padding: 5px !important;
  }

  .ant-table-thead > tr > th {
    padding: 5px 8px !important;
  }
  
  .container-store-info {
    background: #F5F5F5;
    border-radius: 4px;
    padding: 8px;
    
    .ant-row {
      margin-bottom: 5px;
    }
    
    .store-title {
      color: #2A2A86;
      font-weight: 600;
      font-size: 14px;
    }
    
    .store-content {
      color: #262626;
      font-weight: 600;
      font-size: 14px;
    }
    
    .store-detail {
      color: #8C8C8C;
      font-weight: 400;
      font-size: 12px;
    }
    
    .store-detail-content {
      color: #262626;
      font-weight: 400;
      font-size: 12px;
    }
    
    .text-right {
      text-align: right;
    }
  }

  .ant-input-group {
    display: flex !important;
  }
  
  .single {
    display: flex;
    align-items: center;
  }
  
  .no-note {
    color: #8C8C8C;
    font-weight: 400;
    font-size: 14px;
  }
  
  .ant-table-summary {
    .ant-table-cell {
      border: none !important;
    }
  }

  .ant-table.ant-table-bordered > .ant-table-container {
    border-left: none;
  }

  .ant-table-container table > thead > tr:first-child th:first-child {
    border-left: 1px solid #e5e5e5;
  }

  .ant-table-tbody > tr > td:first-child {
    border-left: 1px solid #e5e5e5;
  }
`;
