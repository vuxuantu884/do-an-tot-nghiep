import styled from "styled-components";

export const StyledComponent = styled.div`
  .card {
    &__section {
      &:not(:last-child) {
        margin-bottom: 35px;
      }
    }
    &__footer {
      border-top: 1px solid #e5e5e5;
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

  .po-tag {
    font-size: 12px;
    font-weight: 500;
    margin-top: 0px;
    margin-bottom: 4px;
    border-radius: 15px;
    padding-left: 15px;
    padding-right: 15px;
    background-color: rgba(102, 102, 102, 0.1);
    color: "rgb(102, 102, 102)";
  }
  .po-tag-success {
    background-color: rgba(39, 174, 96, 0.1);
    color: #27ae60;
  }
  .po-tag-warning {
    background-color: #fff7e6;
    color: #fa8c16;
  }
  .checkOut {
    border: 1px solid #e5e5e5;
    border-right: none;
    span[role="img"] {
      margin-right: 5px;
    }
    &__column {
      border-right: 1px solid #e5e5e5;
      height: 100%;
      padding: 15px 20px;
    }
    &__progress {
      &-bar {
        position: relative;
        &__value {
          align-items: center;
          bottom: 0;
          color: #fff;
          display: flex;
          font-size: 12px;
          left: 0;
          padding: 0 15px;
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
