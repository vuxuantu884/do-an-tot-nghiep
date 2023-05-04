import { shiftCustomColor } from "screens/work-shift/work-shift-helper";
import styled from "styled-components";

export const StyledComponent = styled.div`
  .shift-location-selector-header {
    /* padding-left: 30px;
    padding-right: 30px; */
    &-text {
      width: 100%;
      text-align: left;
      color: ${shiftCustomColor.darkBlue};
      font-size: 12px;
      &-border {
        padding: 5px;
        border: 1px solid ${shiftCustomColor.LavenderBlue};
        background: ${shiftCustomColor.AliceBlue};
      }
    }
  }

  .shift-location-selector {
    min-height: 400px;
    display: flex;
    align-content: center;
    flex-direction: column;
    row-gap: 32px !important;
    &-row:first-child {
      margin-top: 16px;
    }
    &-row {
      width: 100%;
      display: inline-flex;
      justify-content: space-between;
      align-items: center;
      /* &-item {
        button {
          white-space: initial;
          padding-left: 0px;
        }
      } */
      &-icon {
        display: inline-flex;
      }
    }
  }

  .yellow-gold {
    color: ${shiftCustomColor.yellowGold};
  }
  .pd-r-5 {
    padding-right: 5px;
  }

  .lavender-blue {
    color: ${shiftCustomColor.LavenderBlue};
  }
  .alice-blue {
    color: ${shiftCustomColor.AliceBlue};
  }

  .dark-blue {
    color: ${shiftCustomColor.darkBlue};
  }
  .bg-alice-blue {
    background: ${shiftCustomColor.AliceBlue};
  }
  .border-lavender-blue {
    border: 1px solid ${shiftCustomColor.LavenderBlue};
  }

  .button-deep-purple {
    background: ${shiftCustomColor.deepPurple};
    border-color: ${shiftCustomColor.deepPurple};
    color: #fff;
  }
`;
