import styled from "styled-components";

export const StyledComponent = styled.div`
  .logoHVC {
    height: 41px;
    width: 100px;
  }
  .ant {
    &-btn-lg {
      padding-top: 4px;
      padding-bottom: 4px;
      height: 38px;
      margin-right: 0;
    }
    &-radio-inner {
      width: 18px;
      height: 18px;
      border: 1px solid #2a2a86;
      &::after {
        background-color: #2a2a86;
        width: 10px;
        height: 10px;
      }
    }

    &-radio-checked {
      &::after {
        border: 1px solid #2a2a86;
      }
    }
  }
  .ant-radio:hover .ant-radio-inner {
    border: 1px solid #2a2a86;
  }
  .ant-radio-input:focus + .ant-radio-inner,
  .ant-radio-wrapper:hover .ant-radio,
  .ant-radio:hover .ant-radio-inner {
    border-color: #2a2a86;
  }
`;
