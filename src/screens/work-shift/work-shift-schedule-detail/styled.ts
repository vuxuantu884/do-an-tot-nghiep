import styled from "styled-components";

export const StyledComponent = styled.div`
  .page-header {
    padding: 0px;
    padding-bottom: 20px;
    .page-header-content {
      display: flex;
      justify-content: space-between;
      button {
        white-space: initial;
        width: 12.5%;
        height: 100px;
      }
      .ant-card {
        width: 30%;
        min-height: 100px;
        .ant-card-body {
          /* display: flex;
          justify-content: center;
          align-items: center; */
          .text-revenue-plan {
            font-size: 16px;
            color: #1677ff;
            &-number {
              display: flex;
              justify-content: space-between;
              &-right {
                font-size: 18px;
                font-weight: 600;
                color: #2a2a86;
              }
            }
          }
          .text-working-hour-quota {
            font-size: 16px;
            color: #1677ff;
            &-number {
              display: flex;
              justify-content: space-between;
              &-right {
                font-size: 18px;
                font-weight: 600;
                color: #3ab67b;
              }
              &-left {
                font-size: 18px;
                font-weight: 600;
                color: #2a2a86;
              }
            }
          }
        }
      }
    }
  }
`;
