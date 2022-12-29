import styled from "styled-components";

export const InventoryBalanceStyle = styled.div`
  .ant-table {
    border-top: 1px solid #d9d9d9;
    .ant-table-body {
      padding-bottom: 14px;
      table > tbody > tr > td {
        border-right: 1px solid #d9d9d9 !important;
        border-bottom: 1px solid #d9d9d9 !important;
      }
    }
    .ant-table-thead > tr > th {
      border-right: 1px solid #d9d9d9 !important;
      border-bottom: 1px solid #d9d9d9 !important;
      white-space: pre-line;
    }
    // .ant-table-thead th {
    //   overflow-wrap: normal;
    //   word-break: normal;
    //   width: 100px !important;
    // }
  }
`;
