import styled from "styled-components";

export const ConfigVATScreenWrapper = styled.div`
  display: flex;
  justify-content: center;
  .card-tax {
    width: 650px;
    .ant-card-body {
      padding: 40px 35px;
    }
  }
  .card-tax-checkbox {
    text-align: center;
  }
  .card-tax-alert {
    margin-top: 20px;
    margin-bottom: 30px;
  }
  .ant-alert-with-description .ant-alert-icon {
    margin-top: 5px;
    font-size: 20px;
  }
  .card-tax-alert-description span {
    display: block;
    font-size: 16px;
    margin-top: 3px;
  }
  .custom-table .ant-table.ant-table-middle .ant-table-thead {
    box-shadow: none;
  }
  .ant-checkbox-disabled .ant-checkbox-inner {
    background-color: #f5f5f5;
    border: 1px solid #d9d9d9;
  }
  .ant-checkbox-checked:after {
    border: 1px solid #2a2a86;
  }
  .ant-checkbox-disabled + span {
    color: #bfbfbf;
    cursor: not-allowed;
  }
  .ant-checkbox-disabled.ant-checkbox-checked .ant-checkbox-inner:after {
    border-color: #bfbfbf;
  }
  .ant-checkbox-inner {
    width: 24px;
    height: 24px;
  }
  .ant-checkbox + span {
    font-size: 20px;
  }
  .country-flag {
    width: 27px;
    height: 18px;
    margin-right: 3px;
  }
`;
