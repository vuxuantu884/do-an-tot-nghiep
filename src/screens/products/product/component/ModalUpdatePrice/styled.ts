import styled from "styled-components";
import { borderColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  position: relative;
  .list__variants {
    .ant-list-items {
      height: 300px;
      overflow-y: auto;
      width: 100%;
      display: flex;
      flex-direction: column;
      .ant-list-item {
        height: 55px;
        border: none;
        padding-left: 10px;
        padding-right: 10px;
        .line-item {
          width: 100%;
          align-items: center;
          display: flex;
          flex-direction: row;
          &-container {
            width: 100%;
            margin-left: 10px;
            display: flex;
            flex-direction: row;
            align-items: center;
            .avatar {
              position: relative;
              width: 40px;
              height: 45px;
              display: flex;
              margin-right: 10px;
              border-radius: 3px;
              img {
                width: 40px;
                height: auto;
                object-fit: cover;
                border-radius: 3px;
              }
              .not-salable {
                position: absolute;
                width: 40px;
                height: 45px;
                font-size: 10px;
                display: flex;
                color: white;
                text-align: center;
                border-radius: 3px;
                align-items: center;
                background-color: rgba(34, 34, 34, 0.7);
              }
            }
          }
          .right__name {
            width: 90%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }
    .ant-list-header {
      border: none;
    }

    .header-tab {
      padding-left: 10px;
      padding-right: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-direction: row;
      .action-button {
        border: 1px solid ${borderColor};
        padding: 6px 15px;
        border-radius: 5px;
        flex-direction: row;
        display: flex;
        background-color: #f5f5f5;
        align-items: center;
        color: #666666;
        &:hover {
          border: 1px solid ${borderColor};
          color: #666666;
          border: 1px solid ${borderColor};
          background-color: #f5f5f5;
        }
        &:focus {
          border: 1px solid ${borderColor};
          color: #666666;
          border: 1px solid ${borderColor};
          background-color: #f5f5f5;
        }
        &.ant-btn-primary {
          color: white;
        }
      }
    }
  }
  .loading-view {
    position: absolute;
    display: flex;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    justify-content: center;
    align-items: center;
    z-index: 99999;
    background-color: rgba(0, 0, 0, 0.2);
  }
`;
