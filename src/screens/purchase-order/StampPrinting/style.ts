import Color from "assets/css/export-variable.module.scss";
import styled from "styled-components";
export const StampPrintingStyle = styled.div`
  .row-action {
    align-items: flex-end;
  }

  .row-info {
    display: flex;
    align-items: flex-start;

    .col-title {
      color: ${Color.labelColor};
      flex-shrink: 0;
    }

    .col-value {
      font-size: 14px;
      font-weight: 500;
    }
  }

  .ant-form-item {
    margin-bottom: 0;
  }

  .input-number {
    height: 32px;

    .ant-input-number-handler-wrap {
      display: none;
    }

    input {
      text-align: right;
      height: 32px;
    }
  }

  .ant-table-tbody > tr > td {
    padding: 4px 10px;
  }
`;
