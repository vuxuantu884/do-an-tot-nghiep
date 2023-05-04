import { shiftCustomColor } from "screens/work-shift/work-shift-helper";
import styled from "styled-components";

export const StyledComponent = styled.div`
  .work-shift-select {
    min-height: 400px;
    display: flex;
    align-content: center;
    row-gap: 8px !important;
    flex-direction: column;
    justify-content: center;

    &-Card {
      display: inline-flex;
      gap: 1px;
      height: 50px;
      &-header {
        padding-top: 10px;
        padding-bottom: 10px;
        display: inline-flex;
        gap: 1px;
        justify-content: space-between;
      }

      &-left {
        button {
          height: 100%;
          width: 70px;
        }
      }
      &-right {
        display: inline-flex;
        flex-wrap: wrap;
        justify-content: space-around;
        align-content: space-between;
        gap: 1px;
        button {
          padding: 0px 24px;
          height: 50%;
        }
        .ant-btn > span {
          display: inline-block;
          width: 28px;
        }
      }
    }
  }

  .yellow-gold {
    color: ${shiftCustomColor.yellowGold};
  }
`;
