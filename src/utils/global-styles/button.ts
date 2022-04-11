import { css } from "styled-components";
import {
  borderColor,
  // colorLuminance,
  dangerColor,
  grayE5Color,
  grayF5Color,
  primaryColor,
  primaryColorHover,
  secondaryColor,
  textBodyColor,
} from "./variables";

export const globalCssCustomButton = css`
  .ant-btn {
    border-radius: 2px;
    height: 38px;
    line-height: 36px;
    padding: 0 20px;
    font-size: 1rem;
    font-weight: normal;
    color: inherit;
    border-color: ${borderColor};
    background-color: #ffffff;
    &-icon-only {
      width: 42px;
      padding: 6px;
      border-color: rgba(223, 223, 223, 0.2);
      background-color: rgba(223, 223, 223, 0.2);
      &.ant-btn-lg {
        width: 42px;
      }
    }
    &-lg {
      height: 42px;
      line-height: 40px;
      padding: 0 20px;
      font-size: 1em;
    }
    &:hover,
    &:focus {
      color: ${primaryColor};
      border-color: ${grayE5Color};
      background: ${grayF5Color};
    }
    &-link {
      border-color: transparent;
      background-color: transparent;
      &:hover,
      &:focus {
        color: ${primaryColor};
        border-color: transparent;
        background-color: transparent;
      }
    }
    &-primary {
      color: white;
      background-color: ${primaryColor};
      border-color: ${primaryColor};
      display: inline-flex;
      align-items: center;
      justify-content: center;
      &:hover,
      &:focus {
        background-color: ${primaryColorHover};
        border-color: ${primaryColorHover};
        color: white;
      }
    }
    &-dangerous {
      color: ${dangerColor};
      border-color: ${dangerColor};
      background-color: transparent;
      &:hover,
      &:focus {
        border-color: ${dangerColor};
        color: ${dangerColor};
        background-color: transparent;
      }
      &.ant-btn-primary {
        background-color: ${dangerColor};
        color: white;
      }
    }
    &-secondary {
      color: ${secondaryColor};
      border-color: ${secondaryColor};
      background-color: transparent;
      &:hover,
      &:focus {
        border-color: #ff8a00;
        color: #ff8a00;
        background-color: transparent;
      }
      &.ant-btn-primary {
        background-color: ${secondaryColor};
        color: white;
        &:hover,
        &:focus {
          background-color: #ff8a00;
          border-color: #ff8a00;
          color: white;
        }
      }
    }
    &-default {
      color: ${textBodyColor};
      border-color: $gray-e5;
      background-color: $gray-f5;
      &:hover,
      &:focus,
      &.active {
        /* color: white;
        background-color: ${primaryColor};
        border-color: ${primaryColor}; */
      }
      &.light {
        background-color: white;
        &:hover,
        &:focus,
        &.active {
          color: ${textBodyColor};
          border-color: ${primaryColor};
        }
      }
      &.danger {
        background-color: ${dangerColor};
        border-color: ${dangerColor};
        color: white;
        &:hover,
        &:focus,
        &.active {
          color: white;
          border-color: ${dangerColor};
        }
      }
    }
  }
  .ant-btn-background-ghost.ant-btn-primary {
    color: ${primaryColor} !important;
    border-color: ${primaryColor} !important;
    background: transparent;
    &:hover {
      background: #f3f3ff !important;
      color: ${primaryColor};
      border-color: ${primaryColor};
    }
  }
`;
