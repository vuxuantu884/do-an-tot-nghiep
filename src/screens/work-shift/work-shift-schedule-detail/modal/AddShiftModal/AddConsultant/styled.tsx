import { shiftCustomColor } from "screens/work-shift/work-shift-helper";
import styled from "styled-components";

export const StyledComponent = styled.div`
  .employee-header {
    padding-left: 30px;
    padding-right: 30px;
    &-text {
      width: 100%;
      text-align: center;
      color: ${shiftCustomColor.blueViolet};
    }
  }

  .employee-content {
    min-height: 400px;
    display: flex;
    align-content: center;

    &-bottom {
      margin-bottom: 15px;
    }
    &-row {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      width: 100%;

      button {
        white-space: initial;
        height: 70px;
      }
    }
  }

  .employee-footer {
    display: inline-flex;
    justify-content: space-between;
    width: 100%;
    margin-top: 24px;
  }

  .button-deep-purple {
    background: ${shiftCustomColor.deepPurple};
    border-color: ${shiftCustomColor.deepPurple};
    color: #fff;
  }
`;
