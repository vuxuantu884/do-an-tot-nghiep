import styled from "styled-components";
import { STATUS_INVENTORY_TRANSFER } from "../../../constants";

export const BG_COLOR_TAG = {
  TRANSFERRING: {
    color: "#FCAF17",
    background: "#FFFBE6"
  },
  CONFIRM: {
    color: "#666666",
    background: "#FAFAFA"
  },
  PENDING: {
    color: "#FCAF17",
    background: "#FFFBE6"
  },
  RECEIVED: {
    color: "#27AE60",
    background: "#FCFFE6"
  },
  CANCELED: {
    color: "#E24343",
    background: "#FFF1F0",
  },
};

export const InventoryTransferTabWrapper = styled.div`
  padding: 0 0 20px 0;

  .file-pin {
    display: inline-block;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .status {
    padding: 2px 8px;
    border-radius: 20px;
    display: flex;
    align-items: center;

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

  .note {
    &-icon {
      margin-left: 10px;
      display: none;
      color: #5656a1;
      cursor: pointer;
    }
    &:hover {
      .note-icon {
        display: unset;
      }
    }
  }

  .mr-5 {
    margin-right: 5px;
    height: 20px;
  }

  .ant-table-selection-column {
    padding: 0 !important;
  }
`;
