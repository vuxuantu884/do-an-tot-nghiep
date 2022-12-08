import styled from "styled-components";

export const StyledComponent = styled.div`
  .ant-btn {
    border-radius: 2px;
  }
  .file-name-import {
    white-space: nowrap;
  }
  .ant-upload {
    .btn-import-file {
      height: 38px;
      color: inherit;
      border-color: rgb(221, 221, 221);
      background-color: rgb(255, 255, 255);
    }
  }
  .download-file-color {
    color: #2a2a86;
  }
  .info-import-file {
    display: inline-flex;
    flex-direction: row;
    justify-content: space-around;
    flex-wrap: nowrap;
    width: 100%;
    .total-color {
      color: #2a2a86;
    }
    .processed-color {
      color: #b08c00;
    }
    .success-color {
      color: #27ae60;
    }
    .error-color {
      color: #ff4d4f;
    }
  }
  .progress-import-file {
    display: inline-flex;
    flex-direction: row;
    justify-content: space-around;
    flex-wrap: nowrap;
    width: 100%;
    padding-left: 40px;
    padding-right: 10px;
  }
  .error-import-file {
    padding: 12px;
    position: relative;
    .ant-col {
      padding: 24px;
      background: #d9d9d9;
      max-height: 400px;
      overflow: auto;
    }
  }
  span.anticon.anticon-close.remove-error-file {
    position: absolute;
    z-index: 1;
    right: 20px;
    top: 20px;
    cursor: default;
  }

  .ant-typography h5,
  div.ant-typography-h5,
  div.ant-typography-h5 > textarea,
  h5.ant-typography {
    margin-bottom: 0.5em;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 500;
    font-size: 16px;
    line-height: 1.5;
  }
`;
