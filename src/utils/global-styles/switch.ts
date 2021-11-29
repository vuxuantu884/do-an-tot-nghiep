import { css } from "styled-components";
import { primaryColor } from "./variables";

export const globalCssSwitch = css`
  .ant-switch-primary.ant-switch-checked {
    background: ${primaryColor};
  }
  .ant-switch-checked {
    background-color: ${primaryColor};
  }
`;
