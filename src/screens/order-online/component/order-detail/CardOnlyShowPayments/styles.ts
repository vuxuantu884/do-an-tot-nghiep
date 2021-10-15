import styled from "styled-components";
import { primaryColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .orders-timeline {
    .ant-collapse-item {
      position: relative;
      &:after {
        content: "";
        position: absolute;
        width: 14px;
        height: 14px;
        top: 16px;
        left: -8px;
        background-color: #27ae60;
        border-radius: 50%;
      }
      &:before {
        content: "";
        position: absolute;
        width: 2px;
        height: 100%;
        background-color: #d9d9e4;
        left: -2px;
        top: -16px;
      }
      &:first-child {
        &:before {
          top: 0;
        }
      }
      .ant-collapse-content-box {
        padding-top: 0 !important;
        padding-bottom: 0 !important;
      }
    }
    &-custom {
      .ant-collapse-header {
        /* position: unset !important;
        display: inline-flex;
        flex-direction: row-reverse;
        align-items: center;
        width: auto;
        color: ${primaryColor} !important; */
        .fixed-button {
          position: absolute;
          right: 0;
          bottom: 0;
        }
        .fixed-total {
          position: absolute;
          left: 50%;
        }
        .fixed-time {
          position: absolute;
          right: 0;
        }
        .ant-collapse-arrow {
          margin-left: 10px;
        }
      }
    }
    /* .ant-collapse-header {
      display: inline-block;
      width: auto;
      color: ${primaryColor} !important;
    } */
  }
`;
