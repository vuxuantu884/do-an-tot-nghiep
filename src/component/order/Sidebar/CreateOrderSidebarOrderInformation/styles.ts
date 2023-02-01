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
  .ant-card-body {
    padding: 16px 20px;
  }

  .marketer-code-required {
    padding-left: 2px;
    color: #e24343;
    font-size: 14px;
    font-family: SimSun, sans-serif;
  }
`;
