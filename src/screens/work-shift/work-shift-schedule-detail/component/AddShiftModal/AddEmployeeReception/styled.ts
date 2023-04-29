import { shiftCustomColor } from "screens/work-shift/work-shift-helper";
import styled from "styled-components";

export const StyledComponent = styled.div`
  .employee-reception-header {
    padding-left: 30px;
    padding-right: 30px;
    &-text {
      width: 100%;
      text-align: center;
      color: ${shiftCustomColor.blueViolet};
      &-border {
        padding: 5px;
        border: 1px solid #b0b0f2;
        background: #f0f0fe;
        color: ${shiftCustomColor.darkCharcoal};
      }
    }
  }

  .employee-reception-content {
    min-height: 400px;
    display: flex;
    align-content: center;
    row-gap: 8px !important;
    flex-direction: column;
    justify-content: center;

    &-Card {
      &-header {
        display: inline-flex;
        gap: 1px;
        &-left {
          width: 86px;
          text-align: center;
        }
        &-right {
          width: calc(100% - 86px);
          text-align: center;
        }
      }
      display: inline-flex;
      gap: 1px;
      height: 65px;
      &-left {
        button {
          height: 100%;
          padding: 0px 24px;
          width: 86px;
        }
      }
      &-right {
        display: inline-flex;
        flex-wrap: wrap;
        justify-content: space-around;
        align-content: space-between;
        gap: 1px;
        button {
          padding-left: 24px;
          padding-right: 24px;
        }
        .ant-btn > span {
          display: inline-block;
          width: 28px;
        }
      }
    }
  }
  .employee-reception-footer {
    display: inline-flex;
    justify-content: space-between;
    width: 100%;
    margin-top: 24px;
    .btn-confirm {
      height: 40px;
      padding: 6px 24px;
    }
  }

  .employee-reception-selected-shift {
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .button-gray {
    background: ${shiftCustomColor.deepPurple};
    border-color: ${shiftCustomColor.deepPurple};
    color: #fff;
  }
  .dark-charcoal {
    color: ${shiftCustomColor.darkCharcoal};
  }
  .dark-grey {
    color: ${shiftCustomColor.darkGrey};
  }
`;
