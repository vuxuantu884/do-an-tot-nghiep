import styled from "styled-components";

export const StyledComponent = styled.div`
  .ant-card-head-title {
    white-space: normal;
  }
  .cardTitle {
    color: #5d5d8a;
    padding-left: 30px;
    position: relative;
    img {
      position: absolute;
      z-index: 1;
      left: 0;
      top: 3px;
    }
  }
  .singleActionHistory {
    &:not(:last-child) {
      margin-bottom: 15px;
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
