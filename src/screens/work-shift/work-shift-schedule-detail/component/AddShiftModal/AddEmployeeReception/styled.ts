import { shiftCustomColor } from "screens/work-shift/work-shift-helper";
import styled from "styled-components";

export const StyledComponent = styled.div`
  .employee-reception-header {
    &-text {
      width: 100%;
      text-align: center;
      color: ${shiftCustomColor.blueViolet};
      &-border {
        padding: 5px 24px;
        border: 1px solid #b0b0f2;
        background: #f0f0fe;
        color: ${shiftCustomColor.darkCharcoal};
        text-align: left;
      }
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
  .yellow-gold {
    color: ${shiftCustomColor.yellowGold};
  }
`;
