import styled from "styled-components";
import { STATUS_INVENTORY_TRANSFER } from "../../../constants";

export const BG_COLOR_TAG = {
  TRANSFERRING: {
    background: '#FFF7E8',
    color: '#FCAF17'
  },
  PENDING: {
    background: '#F7F0EA',
    color: '#E24343'
  },
  RECEIVED: {
    background: '#EAF7F0',
    color: '#27AE60'
  },
}

export const ExportImportTransferTabWrapper = styled.div`
  padding: 0px 0 20px 0;

  .file-pin {
    display: inline-block;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
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

  .product-item-sku {
    font-size: 14px;
    line-height: 18px;
    color: $primary-color;
  }
  .product-item-name {
    font-size: 12px;
    color: #666666;
    margin-top: 5px;
    flex: 1;
    &-detail {
      max-width: 100%;
      white-space: nowrap;
      overflow: hidden;
      line-height: 18px;
      text-overflow: ellipsis;
    }
    &-note {
      padding: 0;
      height: auto;
      font-size: 12px;
      font-weight: normal;
      margin-left: 5px;
      line-height: 18px;
      margin: 0;
    }
    &:hover {
      .product-item-note {
        display: inline-block;
      }
    }
  }

  .note {
    &-icon {
      margin-left: 10px;
      display: none;
      color: #5656A1;
      cursor: pointer;
    }
    &:hover {
      .note-icon {
        display: unset;
      }
    }
  }
  
  .total-quantity {
    color: #2A2A86;
    font-weight: 500;
  }
  
  .text-bold {
    font-weight: bold;
  }
  
  .ml-20 {
    margin-left: 30px;
  }
  
  .mr-5 {
    margin-right: 5px;
  }
  
  .custom-name {
    color: #222222;
    margin-top: 0;
  }
  
  .custom-title {
    color: #2A2A86;
    font-weight: 500;
  }
  .mr-5 {
    margin-right: 5px;
  }
`;
