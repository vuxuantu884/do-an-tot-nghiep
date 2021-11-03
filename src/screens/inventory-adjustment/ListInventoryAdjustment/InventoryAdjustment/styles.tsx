import styled from "styled-components";
import { STATUS_INVENTORY_ADJUSTMENT } from "../constants";

export const BG_COLOR_TAG = {
  DRAFT: {
    background: '#fffff',
    color: '#787878'
  },
  AUDITED: {
    background: '#FFF7E8',
    color: '#FCAF17'
  },
  ADJUSTED: {
    background: '#EAF7F0',
    color: '#27AE60'
  }, 
}

export const InventoryAdjustmentWrapper = styled.div`
  padding: 0px 0 20px 0;
  .page-filter{
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
  }
  
`;