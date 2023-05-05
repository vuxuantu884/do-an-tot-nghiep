import { shiftCustomColor } from "screens/work-shift/work-shift-helper";
import styled from "styled-components";

export const StyledComponent = styled.div`
  .shift-location-selector-header {
    /* padding-left: 30px;
    padding-right: 30px; */
    &-text {
      width: 100%;
      text-align: center;
      color: ${shiftCustomColor.darkBlue};
      font-size: 12px;
      &-border {
        padding: 5px 10px;
        border: 1px solid ${shiftCustomColor.LavenderBlue};
        background: ${shiftCustomColor.AliceBlue};
        text-align: left;
      }
    }
  }

  .shift-location-selector {
    min-height: 400px;
    display: flex;
    align-content: center;

    &-bottom {
      margin-bottom: 15px;
    }
    &-row {
      display: flex;
      justify-content: space-between;
      width: 100%;
      align-items: center;

      button {
        white-space: initial;
        height: 70px;
        width: 31%;
        //background: ${shiftCustomColor.deepPurple};
      }
    }
  }
  .yellow-gold {
    color: ${shiftCustomColor.yellowGold};
  }
  .pd-r-5 {
    padding-right: 5px;
  }
  .button-deep-purple {
    background: ${shiftCustomColor.deepPurple};
    border-color: ${shiftCustomColor.deepPurple};
    color: #fff;
  }
`;
