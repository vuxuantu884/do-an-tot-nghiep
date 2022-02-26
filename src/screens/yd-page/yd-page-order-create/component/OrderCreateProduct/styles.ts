import styled from "styled-components";
import { borderColor, primaryColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .ant-table-tbody > tr > td,
  .ant-table-thead > tr > th,
  .ant-table tfoot > tr > td,
  .ant-table tfoot > tr > th {
    padding: 10px 5px;
  }
  .ant-card-head-wrapper {
    display: flex;
    justify-content: space-between;
  }
  .ant-card-head-title {
    flex: initial;
  }
  .ant-card-extra {
    .ant-form-item {
      margin-bottom: 0;
    }
  }
  .rowSelectStoreAndProducts {
    .ant-form-item {
      margin-bottom: 20px;
    }
  }
  .ant-table-thead > tr > th {
    white-space: nowrap;
  }
  td.yody-table-discount {
    .saleorder-input-group-wrapper {
      padding: 24px 0 0 0;
    }
  }
  
  .discount-table-cell {
    .action-button {
      background-color: white;
      border: none;
      width: fit-content;
      height: 15px;
      padding: 0;
      display: flex;
      float: right;
      margin-bottom: 5px;
    }
  }
  
  .saleorder-input-group-wrapper {
    .yody-table-discount-converted {
      font-size: 0.857rem;
      text-align: right;
      padding-top: 6px;
    }
  }
  td.saleorder-product-card-action {
    padding: 0 5px !important;
    button {
      border: 1px solid ${borderColor};
      width: 28px;
      height: 28px;
      margin: 2px;
      line-height: 26px;
      background: transparent;
      &:hover {
        border-color: ${primaryColor};
      }
    }
  }
  .yody-pos-name {
    .yody-pos-varian-name {
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .splitOrder {
    display: flex;
    align-items: center;
  }

  .row-footer-custom {
    justify-content: space-between;
    text-align: center;
    white-space: nowrap;
  }

  .yd-product-note {
    .ant-input-group-addon {
      padding: 0 5px;
    }
    .ant-input {
      padding: 0 5px;
    }
    .ant-input-affix-wrapper {
      padding: 0;
    }
    .anticon.ant-input-clear-icon {
      margin: 0;
    }
  }

  .yody-table-discount {
    .saleorder-input-group-wrapper {
      height: auto;
      
      .ant-select-selector {
        padding: 0 7px;
      }
      .ant-input-group-compact {
        :first-child {
          border-top-left-radius: 0 !important;
          border-bottom-left-radius: 0 !important;
          border-top-right-radius: 5px !important;
          border-bottom-right-radius: 5px !important;
        }
      }
    }
  }

`;

export const StyledRenderSearchVariant = styled.div`
  .variant-container {
    display: flex;
    justify-content: space-between;
    margin-right: 10px;
    
    .variant-img {
      padding: 5px;
      width: 60px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .variant-name {
      width: 160px;
      .name {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        max-height: 42px;
        line-height: 21px;
      }
    }
    
    .variant-price {
      width: 110px;
    }
  }
`;
