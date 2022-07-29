import { css } from "styled-components";
import { primaryColor } from "./variables";

export const globalCssLayoutOutsideComponent = css`
  .searchDropdown__productTitle {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    max-height: 42px;
    line-height: 21px;
  }
  .ant-select-selection-item {
    .hideInSelect {
      display: none;
    }
  }
  .ant-select-item-option {
    .hideInDropdown {
      display: none;
    }
    .itemParent {
      font-weight: 500;
    }
  }
  .ant-picker-dropdown {
    .datePickerFooter {
      white-space: nowrap;
    }
    .datePickerSelectRange {
      text-align: center;
      cursor: pointer;
      color: ${primaryColor};
      &.active,
      &:hover {
        font-weight: 500;
      }
    }
  }

  .yody-modal-price-product .ant-modal-header {
    padding: 16px 20px 0px 20px;
  }

  .yody-modal-price-product .ant-modal-body {
    padding: 5px 20px;
  }
  .yody-table-product-search .ant-image-mask-info {
    font-size: 10px;
  }
  .yody-text-ellipsis {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .modal-des .ql-align-center img {
    max-width: 100%;
  }

  .modal-des img {
    max-width: 70%;
  }
  .order-filter-drawer {
    .button-option-1 {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      .ant-btn {
        width: 48%;
        height: 36px;
        margin-right: 5px;
      }
    }
    .button-option-2 {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      .ant-btn {
        width: 30%;
        padding: 0px 5px;
        height: 36px;
        line-height: 34px;
      }
    }
    .button-option-3 {
      display: flex;
      justify-content: space-between;
      .ant-btn {
        width: 100%;
      }
    }
    .active {
      color: #ffffff;
      border-color: rgba(42, 42, 134, 0.1);
      background-color: #2a2a86;
    }
    .deactive {
      color: #2a2a86;
      border-color: rgba(42, 42, 134, 0.05);
      background-color: rgba(42, 42, 134, 0.05);
    }
  }
`;
