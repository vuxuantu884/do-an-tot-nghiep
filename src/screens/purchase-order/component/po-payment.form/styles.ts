import styled from "styled-components";
import { borderColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .card {
    &__section {
      &:not(:last-child) {
        margin-bottom: 35px;
      }
    }
    &__footer {
      border-top: 1px solid ${borderColor};
      padding: 20px 15px;
      text-align: right;
    }
  }
  .po-payment-row-title {
    margin-bottom: 10px;
  }
  .shortInformation {
    &__column {
      display: flex;
      .text-field {
        white-space: nowrap;
      }
    }
  }
  .checkOut {
    border: 1px solid ${borderColor};
    border-right: none;
    span[role="img"] {
      margin-right: 5px;
    }
    &__column {
      border-right: 1px solid ${borderColor};
      height: 100%;
      padding: 15px 20px;
    }
    &__progress {
      &-bar {
        position: relative;
        &__value {
          align-items: center;
          bottom: 0;
          color: #222222;
          font-weight: 500;
          display: flex;
          font-size: 12px;
          left: 0;
          padding: 5px 15px 0px 15px;
          position: absolute;
          text-transform: uppercase;
          top: 0;
          white-space: nowrap;
          z-index: 1;
        }
      }
      &-text {
        margin-top: 20px;
      }
    }
  }
  .timeline {
    .ant-timeline-item-head {
      background: none;
      border-color: #27ae60;
      top: -2px;
    }
    .ant-timeline-item-last {
      padding-bottom: 0;
      > .ant-timeline-item-tail {
        display: block;
      }
    }
    .ant-timeline {
      color: #666;
    }
    &__isFinished {
      .ant-timeline-item-head {
        background: #27ae60;
        border: none;
      }
    }
    &__colTitle {
      color: #666666;
    }
    &__status {
      color: #27ae60;
      margin-bottom: 5px;
    }
    &__groupButtons {
      align-items: center;
      display: flex;
      height: 100%;
      justify-content: flex-end;
      > button {
        &:not(:last-child) {
          margin-right: 10px;
        }
      }
    }
  }
`;
