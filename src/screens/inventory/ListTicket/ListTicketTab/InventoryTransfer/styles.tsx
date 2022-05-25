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

export const InventoryTransferTabWrapper = styled.div`
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
  
`;