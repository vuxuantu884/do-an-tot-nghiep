import { shiftCustomColor } from "screens/work-shift/work-shift-helper";
import styled from "styled-components";

export const StyledComponent = styled.div`
  .user-shift-table {
    overflow: auto;
    width: 100%;
    thead,
    tbody {
      th,
      td {
        padding: 2px 10px;
        font-size: 12px;
        font-weight: 400;
        line-height: 20px;
        border: solid 1px #e2e2e2;
        text-align: center;
      }
    }

    .table-header {
      position: sticky;
      top: 0;
      z-index: 1;
      width: 100%;
    }

    .table-body {
      width: 100%;
    }

    .table-group {
      display: flex;
      .user {
        min-width: 200px;
        width: 15%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        .name {
          font-size: 14px;
          line-height: 22px;
          color: ${shiftCustomColor.darkBlue};
        }
        .role {
          font-size: 12px;
          line-height: 20px;
          color: ${shiftCustomColor.darkCharcoal};
        }
        .working-time {
          display: flex;
          flex-wrap: nowrap;
          justify-content: center;
          align-items: center;
          &-icon {
            width: 16px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          &-text {
            color: ${shiftCustomColor.darkCharcoal};
            font-size: 14px;
          }
        }
      }
      .user-shift-group {
        flex-grow: 1;
      }
      .shift-group {
        flex-grow: 1;
        display: flex;
        .shift-date {
          width: 8%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .shift {
          width: 6%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
    }
  }

  .yellow-gold {
    color: ${shiftCustomColor.yellowGold} !important;
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
