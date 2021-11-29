import styled from "styled-components";

export const StyledComponent = styled.div`
  .ant-card-head-title {
    white-space: normal;
  }
  .cardTitle {
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
    padding-bottom: 8px;
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
      border-bottom: 1px solid #e5e5e5;
    }
    &__title {
      font-size: 1em;
      font-weight: 500;
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
