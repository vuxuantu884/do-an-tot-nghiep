import { primaryColor, successColor } from "utils/global-styles/variables";
import styled from "styled-components";

export const StyledComponent = styled.div`
  .overflow-table .rules td.condition {
    font-weight: 500;
    font-size: 15px;
    &.red {
      color: red;
    }
  }

  .overflow-table .rules th.condition-button {
    position: sticky;
    right: -3px;
    transition: background 0.3s;
    background: rgb(243 243 243);
    padding: 10px;
  }

  .overflow-table .rules td.condition-button {
    width: 100px;
    padding: 14px 11px;
    min-height: 70px;
    border: solid 1px #e2e2e2;
    position: sticky;
    right: -3px;
    transition: background 0.3s;
    background: #fff;
    padding: 10px;
  }

  .overflow-table .rules .active {
    color: ${primaryColor};
  }

  .tableElementSticky {
    position: sticky;
    z-index: 9899;
  }
`;
