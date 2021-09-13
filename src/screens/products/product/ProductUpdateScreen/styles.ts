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
          padding: 20px;
        }
      }
    }
  }
  .extra-cards {
    display: flex;
    flex-direction: row;
    align-items: center;
    & > b {
      margin-right: 10px;
    }
    & > label {
      margin-left: 10px;
    }
    &.status {
      width: 250px;
    }
  }
  .label-switch {
    margin-left: 10px;
  }
  .a-container {
    display: flex;
    align-items: center;
    justify-content: center;
    .bpa {
      width: 142px;
      height: 181px;
      background: #fafafa;
      border: 1px dashed #d9d9d9;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      row-gap: 10px;
      cursor: pointer;
    }
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
        &.active,
        &:hover {
          background: #f3f3ff;
          cursor: pointer;
        }
        .line-item {
          align-items: center;
          display: flex;
          flex-direction: row;
          &-container {
            margin-left: 10px;
            display: flex;
            flex-direction: row;
            align-items: center;
            .avatar {
              width: 40px;
              height: 45px;
              display: flex;
              margin-right: 10px;
              border-radius: 3px;
              img {
                width: 100%;
                height: auto;
                object-fit: cover;
                border-radius: 3px;
              }
            }
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
