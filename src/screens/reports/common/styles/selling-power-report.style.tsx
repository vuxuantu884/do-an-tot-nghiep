import styled from "styled-components";

export const SellingPowerReportStyle = styled.div`
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
      padding: 1px 2px;
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

  .ant-table-sticky-scroll {
    bottom: 1px !important;
  }

  .x-text-center {
    text-align: center;
  }
`;
