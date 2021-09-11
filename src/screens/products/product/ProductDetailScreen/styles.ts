import styled from "styled-components";

export const StyledComponent = styled.div`
  padding-bottom: 40px;
  .card {
    margin-top: 20px;
    .card-container {
      .left {
        border-right: 1px solid #e5e5e5;
      }
      .right {
        .header-view {
          padding: 16px 20px;
          border-bottom: 1px solid #e5e5e5;
          justify-content: space-between;
          display: flex;
          flex-direction: row;
          &-left {

          }
          &-right {

          }
        }
      }
    }
  }
`;
