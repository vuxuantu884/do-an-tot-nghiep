import styled from "styled-components";

export const WorkShiftScheduleStyled = styled.div`
  .page-header {
    height: auto;
  }

  .work-shift-list {
    .work-shift-group {
      .work-shift-group-name {
        font-weight: 600;
        font-size: 14px;
        line-height: 22px;
        padding: 8px 10px;
        border-bottom: 1px solid #d9d9d9;
      }
      .work-shift-item {
        display: flex;
        justify-content: space-between;
        padding: 12px 10px;
        border-bottom: 1px solid #d9d9d9;
      }
    }
  }
`;

export const CreateScheduleModalStyled = styled.div`
  .ant-select {
    width: 100%;
    margin-bottom: 20px;
    &:hover {
      border: unset;
      cursor: default;
    }
  }
  .select-month {
    width: 100%;
    margin-bottom: 20px;
  }

  .range-picker {
    width: 100%;
    display: flex;
    align-items: center;
    .ant-picker {
      flex-grow: 1;
      .ant-picker {
        width: 100%;
      }
    }
  }
`;

export const StaffListStyled = styled.div`
  .page-header {
    height: auto;
  }
`;
