import styled from "styled-components";
import { STATUS_INVENTORY_TRANSFER } from "../../../constants";

export const BG_COLOR_TAG = {
  TRANSFERRING: {
    color: "#FCAF17",
  },
  CONFIRM: {
    color: "#666666",
  },
  PENDING: {
    color: "#FCAF17",
  },
  RECEIVED: {
    color: "#27AE60",
  },
  CANCELED: {
    color: "#E24343",
  },
};

export const ExportImportTransferTabWrapper = styled.div`
  padding: 0px 0 20px 0;

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
    .${STATUS_INVENTORY_TRANSFER.REQUESTED.status} {
      color: ${BG_COLOR_TAG.CONFIRM.color};
    }
    .${STATUS_INVENTORY_TRANSFER.CONFIRM.status} {
      color: ${BG_COLOR_TAG.CONFIRM.color};
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
      color: #5656a1;
      cursor: pointer;
    }
    &:hover {
      .note-icon {
        display: unset;
      }
    }
  }

  .total-quantity {
    color: #2a2a86;
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
    font-size: 12px;
    margin-top: 0;
    color: #666666;
  }

  .custom-title {
    color: #2a2a86;
    font-weight: 500;
  }
  .mr-5 {
    margin-right: 5px;
  }

  .mrh-5 {
    margin-right: 5px;
    height: 20px;
  }
`;
