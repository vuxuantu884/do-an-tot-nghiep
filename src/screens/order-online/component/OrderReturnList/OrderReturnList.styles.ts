import styled from "styled-components";

export const StyledComponent = styled.div`
  .order-options {
    border-bottom: 1px solid #5252;
    .ant-radio-group {
      .ant-radio-button-wrapper {
        border-style: none;
        border-width: 0;
        box-shadow: none;
        height: auto;
        padding: 11px 0;
        margin: 0 0 0 32px;
        &:first-child {
          margin-left: 0;
        }
      }
      .ant-radio-button-wrapper:first-child {
        border-left: none;
        border-radius: none;
      }
      .ant-radio-button-wrapper:not(:first-child):before {
        width: 0;
      }
      .ant-radio-button-wrapper-checked {
        color: #2a2a86;
        border-bottom: 2px solid #2a2a86;
      }
    }
  }
`;
