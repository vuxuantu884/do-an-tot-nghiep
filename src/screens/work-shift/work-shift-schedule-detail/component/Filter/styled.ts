import { shiftCustomColor } from "screens/work-shift/work-shift-helper";
import styled from "styled-components";

export const StyledComponent = styled.div`
  .page-filter {
    padding: 0px;
    padding-bottom: 20px;
    .page-filter-content {
      display: flex;
      justify-content: space-between;
      gap: 8px;

      .page-filter-form {
        width: calc(99% - 100px);
        .ant-form-item {
          margin-bottom: 0px;
        }
      }

      &-left {
        width: 100%;
        display: inline-flex;
        justify-content: flex-start;
        align-content: flex-start;
        gap: 8px;
      }
      &-right {
        width: 100px;
        display: inline-flex;
        justify-content: flex-end;
        align-content: flex-start;
        gap: 8px;
        .btn-calendar {
          background: ${shiftCustomColor.lavenderMist};
        }
      }
    }
  }
`;
