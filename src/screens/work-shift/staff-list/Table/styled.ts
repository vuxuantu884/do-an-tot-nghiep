import { shiftCustomColor } from "screens/work-shift/work-shift-helper";
import styled from "styled-components";

export const StyledComponent = styled.div`
  .staff-list-table {
    .action {
      button {
        padding: 6px 0px;
      }
      .transfer {
      }
      .pause {
      }
    }
  }

  .dark-blue {
    color: ${shiftCustomColor.darkBlue};
  }
  .orange-red {
    color: ${shiftCustomColor.orangeRed};
  }
`;
