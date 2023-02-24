import styled from "styled-components";

export const InventoryBalanceStyle = styled.div`
  .ant-table {
    border-top: 1px solid #d9d9d9;
    .ant-table-body {
      padding-bottom: 14px;
      table > tbody > tr > td {
        border-right: 1px solid #d9d9d9 !important;
        border-bottom: 1px solid #d9d9d9 !important;
        padding: 4px;
      }
    }
    .ant-table-thead > tr > th {
      border-right: 1px solid #d9d9d9 !important;
      border-bottom: 1px solid #d9d9d9 !important;
      white-space: pre-line;
      padding: 4px;
    }
  }
  .mb-2 {
    margin-bottom: 1rem;
  }

  .ant-form-item {
    margin: 0;
  }

  .btn-filter {
    margin-right: 10px;
    margin-left: 10px;
  }

  th.text-center {
    text-align: center !important;
  }

  .font-weight-bold {
    font-weight: bold;
  }

  .background-red {
    background-color: #fff1f0;
    color: #cf1322;
    border-radius: 2px;
  }

  .background-yellow {
    background-color: #fff0dd;
    color: #f3ab0cf2;
    border-radius: 2px;
  }

  .background-green {
    background-color: #f6ffed;
    color: #389e0d;
    border-radius: 2px;
  }

  .ant-table-sticky-scroll {
    bottom: 1px !important;
  }

  .progressBar {
    position: relative;
    &-value {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
`;
