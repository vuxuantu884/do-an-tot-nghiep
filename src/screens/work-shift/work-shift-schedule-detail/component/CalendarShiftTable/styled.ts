import { shiftCustomColor } from "screens/work-shift/work-shift-helper";
import styled from "styled-components";

export const StyledComponent = styled.div`
  .calendar-table {
    /* overflow: auto;
    width: 100%;
    max-height: 800px; */
    width: 100%;
    overflow-x: auto;
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
    top: 50;
    z-index: 1;
  }

  .calendar-table .rules .condition {
    padding: 11px;
    /* width: 250px; */
    min-height: 54px;
    font-size: 14px;
    line-height: 10px;
    border: solid 1px #e2e2e2;
    text-align: center;
  }

  .calendar-table .rules .condition:first-child {
    text-align: center;
    background: ${shiftCustomColor.lightSlateGray};
    /* width: 120px; */
  }

  .calendar-table .rules td.condition {
    font-weight: 500;
    font-size: 15px;
    .shift-view {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      &-ca {
        color: ${shiftCustomColor.darkCharcoal};
        font-size: 14px;
        font-weight: 400;
      }
      &-time {
        color: ${shiftCustomColor.darkCharcoal};
        font-size: 14px;
        font-weight: 600;
      }
    }

    .revenue,
    .shift-plan,
    .shift-plan-detail {
      display: inline-flex;
      flex-wrap: nowrap;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      &-icon {
      }
      &-text {
        color: ${shiftCustomColor.darkCharcoal};
        font-size: 14px;
        font-weight: 400;
      }
      &-font {
        font-size: 12px !important;
      }
    }
  }

  .calendar-table .rules th.condition {
    padding: 6px;
    line-height: 22px;
    color: ${shiftCustomColor.darkCharcoal};
    background: ${shiftCustomColor.lightSlateGray};
    .header {
      display: inline-flex;
      flex-direction: column;
      flex-wrap: nowrap;
      align-items: center;
      flex-wrap: nowrap;
    }
  }

  .dark-grey {
    color: ${shiftCustomColor.darkGrey} !important;
  }
  .dark-blue {
    color: ${shiftCustomColor.darkBlue} !important;
  }
  .yellow-gold {
    color: ${shiftCustomColor.yellowGold} !important;
  }
  .lime-green {
    color: ${shiftCustomColor.limeGreen} !important;
  }
  .fw-600 {
    font-weight: 600 !important;
  }
  .fw-400 {
    font-weight: 400 !important;
  }
  .fz-12 {
    font-size: 12px;
  }
`;
