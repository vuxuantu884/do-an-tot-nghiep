import styled from "styled-components";

export const StyledComponent = styled.div`
  .revenue-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    .ant-card {
      position: absolute;
      top: 40%;
      left: 36%;
      width: 40%;
      box-shadow: none;
      border-radius: initial;
      .ant-card-head {
        padding: 20px 0px 15px 20px;
        background-color: rgb(0 0 0 / 12%);
      }

      .ant-card-body {
        padding: 40px 20px;
        .ant-select {
          display: block;
        }
      }

      .ant-card-actions > li {
        padding: 0px 12px;
        span {
          display: flex;
          justify-content: flex-end;
        }
      }
    }
  }
`;
