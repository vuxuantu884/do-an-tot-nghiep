import { css } from "styled-components";
import { dangerColor, primaryColor } from "./variables";

export const globalCssCustomForm = css`
  .ant-form label {
    font-size: 1rem;
  }
  .ant-form-item-label > label {
    font-weight: 500;
  }
  .ant-form-item-label
    label.ant-form-item-required:not(.ant-form-item-required-mark-optional)::after {
    position: absolute;
    display: inline-block;
    margin: 0;
    color: ${dangerColor};
    font-size: 14px;
    font-family: SimSun, sans-serif;
    line-height: 24px;
    right: -10px;
    top: -4px;
    content: "*";
  }
  .ant-form-item-label label .ant-form-item-tooltip {
    color: ${primaryColor};
  }
`;
