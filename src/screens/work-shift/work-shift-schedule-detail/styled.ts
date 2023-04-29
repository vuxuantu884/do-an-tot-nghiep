import styled from "styled-components";
import { shiftCustomColor } from "../work-shift-helper";

export const StyledComponent = styled.div`
  .page-header {
    padding: 0px;
    padding-bottom: 20px;
    .page-header-content {
      display: flex;
      justify-content: space-between;
      button {
        white-space: initial;
        width: 19%;
        height: 100px;
      }
      .ant-card {
        width: 20%;
        min-height: 100px;
        .ant-card-body {
          /* display: flex;
          justify-content: center;
          align-items: center; */
          .text-revenue-plan {
            font-size: 16px;
            color: ${shiftCustomColor.deepPurple};
            &-number {
              display: flex;
              justify-content: space-between;
              &-right {
                font-size: 18px;
                font-weight: 600;
                color: ${shiftCustomColor.darkBlue};
              }
            }
          }
          .text-working-hour-quota {
            font-size: 16px;
            color: ${shiftCustomColor.deepPurple};
            &-number {
              display: flex;
              justify-content: space-between;
              &-right {
                font-size: 18px;
                font-weight: 600;
                color: ${shiftCustomColor.limeGreen};
              }
              &-left {
                font-size: 18px;
                font-weight: 600;
                color: ${shiftCustomColor.darkBlue};
              }
            }
          }
        }
      }

      @media only screen and (min-width: 1366px) {
        .ant-card {
          width: 30%;
        }
        button {
          width: 12.5%;
        }
      }
      @media only screen and (min-width: 1536px) {
        .ant-card {
          width: 25%;
        }
        button {
          width: 16%;
        }
      }
      @media only screen and (min-width: 1920px) {
        .ant-card {
          width: 20%;
        }
        button {
          width: 19%;
        }
      }
    }
  }
`;
