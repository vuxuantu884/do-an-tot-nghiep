import styled from "styled-components";
import { STATUS_INVENTORY_ADJUSTMENT } from "../constants";

export const BG_COLOR_TAG = {
  DRAFT: {
    background: "#fffff",
    color: "#787878",
  },
  AUDITED: {
    background: "#FFF7E8",
    color: "#FCAF17",
  },
  ADJUSTED: {
    background: "#EAF7F0",
    color: "#27AE60",
  },
};

export const InventoryAdjustmentWrapper = styled.div`
  .page-filter {
    padding: 0;
  }

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

    &.${STATUS_INVENTORY_ADJUSTMENT.DRAFT.status} {
      background: ${BG_COLOR_TAG.DRAFT.background};
      color: ${BG_COLOR_TAG.DRAFT.color};
    }
    &.${STATUS_INVENTORY_ADJUSTMENT.AUDITED.status} {
      background: ${BG_COLOR_TAG.AUDITED.background};
      color: ${BG_COLOR_TAG.AUDITED.color};
    }
    &.${STATUS_INVENTORY_ADJUSTMENT.ADJUSTED.status} {
      background: ${BG_COLOR_TAG.ADJUSTED.background};
      color: ${BG_COLOR_TAG.ADJUSTED.color};
    }
    .ellipses-text {
      overflow: "hidden";
      text-overflow: "ellipsis";
      display: "-webkit-box";
      -webkit-line-clamp: 3;
      -webkit-box-orient: "vertical";
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

  .btn-report {
    height: 24px;
    line-height: 24px;
    color: #fcaf17;
    padding: 0 5px;
    font-size: 12px;
    border: 1px solid #fcaf17 !important;
    margin-right: 12px;
    margin-top: 5px;
  }

  .icon-report {
    margin-right: 8.64px;
  }
`;
