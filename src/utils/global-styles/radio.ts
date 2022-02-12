import { css } from "styled-components";
import { primaryColor } from "./variables";

export const globalCssCustomRadio = css`
  .ant-radio-checked {
    &:after {
      border-color: ${primaryColor};
    }
    .ant-radio-inner {
      border-color: ${primaryColor};
      &:after {
        background: ${primaryColor};
      }
    }
  }
  .ant-radio:hover .ant-radio-inner {
    border-color: ${primaryColor};
  }
  .ant-radio-button-wrapper {
    &:hover {
      color: ${primaryColor};
    }
  }
`;
