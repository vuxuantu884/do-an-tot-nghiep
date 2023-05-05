import { shiftCustomColor } from "screens/work-shift/work-shift-helper";
import styled from "styled-components";

export const WorkShiftDetailModalStyled = styled.div`
  .work-shift-info {
    display: flex;
    justify-content: space-between;
    .work-shift-col {
      background-color: #fafafa;
      padding: 10px 20px;
      width: 50%;
      .description {
        color: #5858b6;
        font-weight: 400;
        font-size: 14px;
        line-height: 22px;
      }
      .value {
        color: #2a2a86;
        font-weight: 600;
        font-size: 16px;
        line-height: 24px;
      }
    }
    .left-item {
      margin-right: 8px;
    }
  }

  .work-shift-tabs-list {
    min-height: 420px;
    margin-top: 16px;
    .ant-tabs-nav {
      padding: 0;
    }
    .ant-tabs-nav-list {
      width: 100%;
      .ant-tabs-tab {
        width: 50%;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        font-weight: 600;
        font-size: 14px;
        line-height: 22px;
        color: #262626;
        margin: 0;
      }
      .ant-tabs-tab-active {
        background: #f0f0fe;
        color: #2a2a86;
      }
    }
  }
`;
export const WorkShiftStaffTabStyled = styled.div`
  .add-staff {
    display: flex;
    align-items: flex-start;
    margin-bottom: 12px;
    .description {
      margin-right: 4px;
      margin-top: 7px;
    }
    .select-staff {
      flex-grow: 1;
      margin-right: 40px;
      .ant-select {
        width: 100%;
      }
      .select-staff-warning {
        padding: 1px 16px;
        background: #fffbe6;
        border: 1px solid #ffe58f;
        border-radius: 2px;
        color: ${shiftCustomColor.yellowGold};
        margin-top: 4px;
      }
    }
  }
  .staff-table {
    .delete-staff-button {
      color: ${shiftCustomColor.orangeRed};
      &:hover {
        cursor: pointer;
      }
    }
  }
  .delete-staff-expand {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    .delete-button-group {
      width: 280px;
      margin-left: 80px;
    }
  }
`;

export const WorkShiftAssignmentLogTabStyled = styled.div`
  .assignment-log-list {
    max-height: 330px;
    overflow: auto;
    .assignment-log-item {
      margin-bottom: 20px;
      .action-by {
        color: ${shiftCustomColor.darkCharcoal};
        font-weight: 600;
        margin-right: 8px;
      }
    }
  }
`;
