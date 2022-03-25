import styled from "styled-components";

export const StyledComponent = styled.div`
  z-index: 1;
  .yd-page-self-delivery-shipment {
    .ant-form-item-explain-error {
      display: none;
    }
    .ant-form-item {
      margin-bottom: 8px;
    }
    .ant-select-selector {
      height: 32px;
    }
    .ant-input {
      height: 32px;
    }
    .ant-select-selector .ant-select-selection-placeholder {
      line-height: 32px;
    }
    .options {
      display: flex;
      justify-content: space-between;
    }
    .shipment4h {
      color: red;
      font-weight: bold;
      width: 120px;
    }
    .delivery-type {
      flex-grow: 1;
      display: flex;
      justify-content: space-evenly;
    }
  }
  
`;
