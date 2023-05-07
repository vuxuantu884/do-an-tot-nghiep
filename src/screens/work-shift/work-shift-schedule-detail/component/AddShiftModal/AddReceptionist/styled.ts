import { shiftCustomColor } from "screens/work-shift/work-shift-helper";
import styled from "styled-components";

export const StyledComponent = styled.div`
  .sort-receptionist-header {
  }
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

  .sort-receptionist-footer {
    display: inline-flex;
    justify-content: space-between;
    width: 100%;
    margin-top: 24px;
    .btn-confirm {
      height: 40px;
      padding: 6px 24px;
    }
  }
`;
