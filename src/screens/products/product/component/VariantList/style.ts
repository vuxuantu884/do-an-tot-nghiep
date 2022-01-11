import styled from "styled-components";
import { borderColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  position: relative;
  .list__variants {
    .ant-list-items {
      height: 450px;
      overflow-y: auto;
      width: 100%;
      display: flex;
      flex-direction: column;
      .ant-list-item {
        height: 55px;
        border: none;
        padding-left: 10px;
        padding-right: 10px;
        &.active,
        &:hover {
          background: #f3f3ff;
          cursor: pointer;
          .right__name {
            width: 100%;
            -moz-transform: translateX(50%);
            -webkit-transform: translateX(50%);
            transform: translateX(50%);
            -moz-animation: bouncing-text 5s linear infinite alternate;
            -webkit-animation: bouncing-text 5s linear infinite alternate;
            animation: bouncing-text 10s linear infinite alternate;
          }
          @-moz-keyframes bouncing-text {
            0% {
              -moz-transform: translateX(50%);
            }
            100% {
              -moz-transform: translateX(-50%);
            }
          }

          @-webkit-keyframes bouncing-text {
            0% {
              -webkit-transform: translateX(50%);
            }
            100% {
              -webkit-transform: translateX(-50%);
            }
          }

          @keyframes bouncing-text {
            0% {
              -moz-transform: translateX(50%);
              -webkit-transform: translateX(50%);
              transform: translateX(50%);
            }
            100% {
              -moz-transform: translateX(-50%);
              -webkit-transform: translateX(-50%);
              transform: translateX(-50%);
            }
          }
        }
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
                height: 40px;
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
            // width: 90%;
            // white-space: nowrap;
            // overflow: hidden;
            // text-overflow: ellipsis;
          }
          .sku {
            font-weight: 500;
            color: #11006f;
          }
          .variant-name {
            white-space: nowrap;
            width: 90%;
            max-width: 250px;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 12px;
            opacity: 0.8;
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
