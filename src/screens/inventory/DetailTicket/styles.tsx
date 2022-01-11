import styled from "styled-components";
import { borderColor } from "utils/global-styles/variables";
import { STATUS_INVENTORY_TRANSFER } from "../ListTicket/constants";
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
      &:hover{
        background-color: #2a2a86;
        color: #fff;
      }
    }
  }
  .ant-table-summary>tr>td, .ant-table-summary>tr>th {
    border-bottom: none;
  }

  .inventory-transfer-table, .inventory-info {
    .ant-tag {
      padding: 2px 8px;
      border-radius: 20px;
  
      &.${STATUS_INVENTORY_TRANSFER.TRANSFERRING.status} {
        background: ${BG_COLOR_TAG.TRANSFERRING.background};
        color: ${BG_COLOR_TAG.TRANSFERRING.color};
      }
      &.${STATUS_INVENTORY_TRANSFER.PENDING.status} {
        background: ${BG_COLOR_TAG.PENDING.background};
        color: ${BG_COLOR_TAG.PENDING.color};
      }
      &.${STATUS_INVENTORY_TRANSFER.RECEIVED.status} {
        background: ${BG_COLOR_TAG.RECEIVED.background};
        color: ${BG_COLOR_TAG.RECEIVED.color};
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

      & .ant-collapse-header{
        position: absolute;
        right: 30px;
        z-index: 2;
      }
    }

    .ant-timeline-item-last>.ant-timeline-item-content {
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
`;
