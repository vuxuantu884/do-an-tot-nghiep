import { css } from "styled-components";
import { borderColor, primaryColor } from "./variables";

export const globalCssCustomButton = css`
  .ant-btn {
    border-radius: 2px;
    height: 38px;
    line-height: 36px;
    padding: 0 20px;
    font-weight: normal;
    color: inherit;
    border-color: ${borderColor};
    background-color: white;
  }
  .ant-btn-background-ghost.ant-btn-primary {
    color: ${primaryColor};
    border-color: ${primaryColor};
    &:hover {
      color: ${primaryColor};
      border-color: ${primaryColor};
    }
  }
`;
