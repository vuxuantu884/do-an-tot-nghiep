import { successColor } from "utils/global-styles/variables";
import styled from "styled-components";

export const StyledComponent = styled.div`
  .overflow-table .rules td.condition {
    font-weight: 500;
    font-size: 15px;
    &.red {
      color: red;
    }
  }
  .overflow-table .rules td.condition-button {
    width: 100px;
    padding: 14px 11px;
    min-height: 70px;
    border: solid 1px #e2e2e2;
  }

  .overflow-table .rules .active {
    color: ${successColor};
  }

  .tableElementSticky {
    position: sticky;
    z-index: 9899;
  }
`;
