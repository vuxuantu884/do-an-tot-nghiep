import styled from "styled-components";

export const StyledComponent = styled.div`
  .calendar-table {
    overflow: auto;
    width: 100%;
    max-height: 800px;
  }

  .calendar-table::-webkit-scrollbar {
    width: 0px;
    height: 6px;
  }

  .calendar-table .rules {
    thead {
      background: #f5f5f5;
    }

    box-shadow: 0px 2px 0px rgba(0, 0, 0, 0.1);
    /* width: 100%; */
  }

  .calendar-table .rules-sticky {
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .calendar-table .rules .condition {
    padding: 14px 11px;
    width: 250px;
    min-height: 54px;
    font-size: 14px;
    line-height: 16px;
    border: solid 1px #e2e2e2;
    text-align: center;
  }

  .calendar-table .rules .condition:first-child {
    text-align: left;
    width: 100px;
  }

  .calendar-table .rules td.condition {
    font-weight: 500;
    font-size: 15px;
    &.red {
      color: red;
    }
  }
`;
