import { primaryColor } from './../../../../utils/global-styles/variables';
import styled from "styled-components";
import { borderColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .ant-card-head-title {
    white-space: normal;
  }
  .cardTitle {
    color: #5d5d8a;
    font-size: 14px;
    padding-left: 30px;
    position: relative;
    img {
      left: 0;
      position: absolute;
      top: 1px;
      z-index: 1;
    }
  }
  .singleActionHistory {
    padding-top: 10px;
    &:hover {
      cursor: pointer;
      .singleActionHistory__mainStatus,
      .singleActionHistory__title {
        text-decoration: underline;
      }
    }
    &:first-child {
      padding-top: 0;
    }
    &:not(:last-child) {
      padding-bottom: 10px;
      border-bottom: 1px solid ${borderColor};
    }
    &__title {
      font-size: 1em;
      font-weight: 500;
    }
    &__store {
      font-size: ${13/14}em;
      font-weight: 500;
      color: ${primaryColor};
    }
    &__date {
      color: #737373;
    }
    &__mainStatus {
      color: #2a2a86;
      cursor: pointer;
      font-weight: 500;
    }
    &__subStatus {
      color: #737373;
    }
  }
`;
