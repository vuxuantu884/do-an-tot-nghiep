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
  .label-switch {
    margin-left: 10px;
  }
  .data-content {
    color: #222222;
    height: 200px;
    overflow: auto;
    padding: 10px 5px;
    border: 1px solid #d9d9d9;
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
  .view-right {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .image-view {
    width: 280px;
    align-items: center;
    display: flex;
    flex-direction: column;
    .item-default {
      width: 163px;
    }
    .image-slider {
      width: 163px;
      margin-bottom: 10px;
      img {
        width: 163px !important;
        height: 253.5;
        align-items: center
      }
    }
    .image-thumbnail {
      width: 280px;
      img {
        width: 80px !important;
        cursor: pointer;
      }
    }
  }
`;
