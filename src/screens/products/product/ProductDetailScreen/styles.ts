import styled from "styled-components";
import { borderColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  padding-bottom: 40px;
  .card {
    margin-top: 20px;
    .card-container {
      .left {
        border-right: 1px solid ${borderColor};
      }
      .right {
        .header-view {
          padding: 16px 20px;
          border-bottom: 1px solid ${borderColor};
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
    &-image {
      display: flex;
      align-items: center;
      justify-content: center;
      img {
        border: 1px dashed #d9d9d9;
        height: 165px;
        width: 165px;
        object-fit: contain;
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
  }
  .label-switch {
    margin-left: 10px;
  }
  .data-content {
    color: #222222;
    height: 185px;
    overflow: auto;
    padding: 10px 5px;
    border: 1px solid #d9d9d9;
  }
  .data-empty {
    color: red;
    height: 185px;
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
        align-items: center;
      }
    }
    .image-thumbnail {
      width: 280px;
      &.image-2 {
        width: 130px;
      }
      img {
        width: 60px !important;
        height: 60px !important;
        cursor: pointer;
      }
    }
  }
  .care-title {
    margin-bottom: 10px;
    color: #666666;
  } 
  .care-label {
    font-size: 28px;
    vertical-align: -0.125em;
    margin: 2px 4px 15px 6px;
  }

  .row-detail {
    margin-bottom: 15px;
    font-size: 14px;
    display: flex;
    flex-direction: row;
    width: 100%;
    &-left {
      width: 35%;
    }
    &-right {
      width: 65%;
    }
    .dot {
      margin-right: 10px;
    }
    .title {
      color: #666666;
    }
    .data {
      color: #222222;
      font-weight:500;
    }
    .row-detail-right{
      word-wrap: break-word;
    }
    .row-detail-right .ant-tag{
      margin-top: 0; 
      font-size: 14px;
    }

    .button-plus {
      border: 1px solid #E5E5E5;
      background: #FFFFFF;
      color: #757575;
      .anticon {
        vertical-align: 0.125em;
      }
    }
  }
`;
