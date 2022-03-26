import styled from "styled-components";

export const StyledComponent = styled.div`
  display: block;
  .ant-form-item {
    &:last-child {
      margin-bottom: 0;
    }
  }
  .ant-form-item-label {
    padding: 0 0 5px;
  }
  .ant-form-item {
    margin-bottom: 15px;
  }

  .ant-card-head {
    padding: 20px;
    border-bottom: none;
  }

  .ant-card-body {
    padding: 0 20px 20px 20px;
  }

  .staff-form-input {
    flex-direction: column !important;
  }

  .ant-card-head-wrapper .ant-card-head-title {
    line-height: 18px;
    padding: 6px 0 0 0;
  }
  
  .ant-select:not(.ant-select-customize-input) .ant-select-selector {
    height: 32px;
   & .ant-select-selection-item, .ant-select-selection-placeholder {
    color: #737373;
    line-height: 32px;
   }
   .ant-select-selection-search-input {
     height: 32px;
   }
  }

  .note-form-input::placeholder {
    color: #737373;
  }
`;
