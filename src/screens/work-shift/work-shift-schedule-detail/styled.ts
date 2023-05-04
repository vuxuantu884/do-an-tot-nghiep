import styled from "styled-components";
import { shiftCustomColor } from "../work-shift-helper";

export const StyledComponent = styled.div`
  .page-header {
    padding: 0px;
    padding-bottom: 20px;
    .page-header-content {
      display: flex;
      justify-content: space-between;
      .shift-scheduler {
        white-space: initial;
        display: inline-flex;
        flex-direction: column;
        justify-content: center;
        width: 20%;
        gap: 5px;
        button {
          height: 50%;
        }
      }
      .ant-card {
        width: 39.5%;
        min-height: 73px;
        margin-bottom: 0px;
        .ant-card-body {
          padding: 10px 24px;
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
              &-left {
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

      /* @media only screen and (min-width: 1366px) {
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
      } */
      @media only screen and (min-width: 1920px) {
        .ant-card {
          width: 39.5%;
        }
        .shift-scheduler {
          width: 20%;
        }
      }
    }
  }

  .page-content {
    .ant-card-body {
      padding-top: 10px;
      padding-bottom: 10px;
    }
  }

  .extra-option button {
    padding: 6px 35px;
  }

  .text-dark-Blue {
    color: ${shiftCustomColor.darkBlue};
  }
`;
