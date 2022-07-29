import styled from "styled-components";

export const StyledComponent = styled.div`
  .sectionFilter {
    .ant-form-item {
      width: 100%;
    }
    .ant-form-item-control-input {
      width: 100%;
    }
    > .ant-col {
      /* align-items: flex-end; */
      display: flex;
    }
    .columnActive {
      padding-top: 40px;
    }
    label {
      font-weight: 500;
    }
  }
  .ant-form-item {
    margin-bottom: 0;
  }
  .ant-form-item-label {
    text-align: left;
    width: 100%;
  }
  .ant-select-disabled.ant-select:not(.ant-select-customize-input) .ant-select-selector {
    color: inherit;
  }
  .ant-checkbox-disabled + span,
  .ant-input[disabled] {
    color: inherit;
  }
  .ant-checkbox-disabled.ant-checkbox-checked .ant-checkbox-inner:after {
    border-color: #f5f5f5;
  }
`;
