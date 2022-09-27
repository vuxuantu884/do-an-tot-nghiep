import { css } from "styled-components";
import {
  borderColor,
  borderRadius,
  focusBorderColor,
  primaryColor,
  textBodyColor,
} from "./variables";

export const globalCssCustomInput = css`
  .ant {
    &-input {
      height: 38px;
      padding: 7px 14px;
      border-color: ${borderColor};
      font-size: 1rem;
      border-radius: ${borderRadius};
      color: ${textBodyColor};
      &-lg {
        font-size: 1em;
      }
      &:hover,
      &:focus {
        border-color: ${focusBorderColor};
        box-shadow: unset;
      }
      &-affix-wrapper {
        padding: 0;
        padding-right: 11px;
        border-color: ${borderColor};
        border-radius: ${borderRadius};
        &-focused {
          border-color: ${focusBorderColor};
        }
        &:hover,
        &:focus {
          border-color: ${focusBorderColor};
          box-shadow: unset;
        }
        &:not(&-disabled) {
          &:hover,
          &:focus {
            border-color: ${focusBorderColor};
            box-shadow: unset;
          }
        }
        .ant-input-prefix {
          margin-left: 10px;
          margin-right: 0;
        }
        & > input.ant-input {
          height: 36px;
          padding: 4px 14px;
        }
        & > .ant-input-prefix + input.ant-input {
          padding-left: 5px;
        }
      }
      &-number {
        box-shadow: none;
        &.ant-input-number-focused,
        &:hover,
        &:focus {
          border-color: ${primaryColor};
        }
      }
    }
  }
`;
