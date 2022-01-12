import styled from "styled-components";

export const OrderThresholdStyle = styled.div`
  width: 100%;
  .ant-table-thead {
    box-shadow: none !important;
    th {
      border-bottom: none !important;
      box-shadow: none !important;
      background-color: #ffffff;
    }
  }

  .ant-table-footer {
    background: #ffffff;
  }

  .ant-input-group-addon {
    width: 58px;
  }
  .remove-btn {
    /* border: none; */
    display: flex;
    align-items: center;
  }
  .add-btn {
    display: flex;
    align-items: center;
    border: none;
    margin-left: -16px;
    color: #2a2a86;
  }
  .ant-table-row {
    .ant-row .ant-form-item {
      margin: 0;
    }
    .ant-table-cell {
      vertical-align: top;
    }
  }

  table {
    width: 100%;
    table-layout: fixed;
    thead { 
      th {
        width: 30%;
      }
      th:last-child {
        width: 10%;
      }
    }
    tr {
      vertical-align: top;
      td {
        padding-right: 20px;
      }
      td:last-child {
        padding-right: 0;
      }
    }
  }
`;
