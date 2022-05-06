import styled from "styled-components";

export const StyledComponent = styled.div`
  .overflow-table .rules td.condition {
    font-weight: 500;
    font-size: 15px;
    &.red {
      color: red;
    }
  }
  .tableElementSticky {
    position: sticky;
    z-index: 9899
  }
`;
