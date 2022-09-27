import { css } from "styled-components";
import { primaryColor } from "./variables";

export const globalCssCustomSelect = css`
  .ant-select {
    font-size: 1rem;
  }
  .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
    color: ${primaryColor};
    svg {
      fill: ${primaryColor};
    }
  }
`;
