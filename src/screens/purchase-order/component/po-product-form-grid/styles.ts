import styled from "styled-components";

export const PoProductFormContainer = styled.div` .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.policy {
  display: flex;
  align-items: center;
}

.policy-txt {
  font-weight: 400;
  font-size: 14px;
  line-height: 16px;
  margin-right: 8px;
  text-transform: capitalize;
}

.input-group {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.input-search {}

.footer {
  padding-top: 36px;
}

.ant-input-affix-wrapper {
  padding: 0;

  .vat-suffix {
    height: 100%;
    width: 30px;
    background-color: #f5f5f5;
    border-radius: 5px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.product-item-vat{
  input {
    text-align: right;
    padding : 0;
  }
}
.product-table-new {
  .ant-table-cell {
  padding: 5px;
  }
  
.size-input {
  width: 100%;
  .ant-input-number-handler-wrap {
    display: none;
  }

  input {
    text-align: right;
  }
}
}
`;
