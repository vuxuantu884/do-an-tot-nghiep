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
        .container-view {
          padding: 20px
        }
      }
    }
  }
  .data-content {
    color: #222222;
    height: 150px;
    overflow: auto;
  }
  .list__variants {
    .ant-list-items {
      height: 450px;
      overflow: auto;
      .ant-list-item {
        height: 55px;
        border: none;
        padding-left: 10px;
        padding-right: 10px;
        &.active, &:hover{
          background: #F3F3FF;
          cursor: pointer;
        }
        .line-item {
          align-items: center;
          display: flex;
          flex-direction: row;
          &-container {
            margin-left: 10px;
          }
        }
      }
    }
    .ant-list-header {
      border: none;
      padding-top: 16px;
      padding-bottom: 16px;
    }

    .header-tab {
      padding-left: 10px;
      padding-right: 10px;
    }
  }
`;
