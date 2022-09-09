import styled from "styled-components";
import { dangerColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .actionButton {
    border: none;
    width: 30px;
    height: 30px;
    background: none;
    padding: 0;
    line-height: 30px;
  }
  .menuButton {
    background: transparent;
    border: none;
    padding: 0;
    &.deleteButton {
      color: ${dangerColor};
    }
  }
  .dailyRevenueTable {
    margin-bottom: 20px;
    &.hide {
      display: none;
    }
    th {
      text-align: center !important;
    }
  }
`;
