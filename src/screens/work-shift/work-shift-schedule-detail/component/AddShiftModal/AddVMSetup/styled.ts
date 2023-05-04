import { shiftCustomColor } from "screens/work-shift/work-shift-helper";
import styled from "styled-components";

export const StyledComponent = styled.div`
  .text-sort-receptionist {
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
`;
