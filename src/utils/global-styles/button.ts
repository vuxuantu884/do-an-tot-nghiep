import { css } from "styled-components";
import { primaryColor } from "./variables";

export const globalCssCustomButton = css`
  .ant-btn-background-ghost.ant-btn-primary {
    color: ${primaryColor};
    border-color: ${primaryColor};
    &:hover {
      color: ${primaryColor};
      border-color: ${primaryColor};
    }
  }
`;
