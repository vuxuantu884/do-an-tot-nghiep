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
  td.yody-pos-name {
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
`;
