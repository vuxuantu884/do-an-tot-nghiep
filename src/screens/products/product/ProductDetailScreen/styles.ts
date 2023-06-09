import styled from "styled-components";
import { borderColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  padding-bottom: 40px;
  .card {
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
        .divider-row {
          margin-top: 0px;
        }
        .tooltip-price {
          cursor: pointer;
        }
        .tax-alert {
          width: fit-content;
          &-title {
            color: #666666;
          }
          &-content {
            margin-left: 3px;
            color: #222222;
            font-weight: 500;
          }
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
    .status {
      .text-success {
        color: #2a2a86;
      }
    }
  }
  .label-switch {
    margin-right: 10px;
    color: #262626;
    font-weight: 500;
  }
  .data-content {
    color: #222222;
    max-height: 160px;
    overflow: auto;
    padding: 10px 0px;
    // border: 1px solid #d9d9d9;
  }
  .data-content::-webkit-scrollbar {
    width: 1px;
    height: 8px;
  }
  .modal-des .ql-align-center img {
    max-width: 100%;
  }
  .img {
    max-width: 70%;
  }
  .data-empty {
    color: red;
    height: 144.5px;
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
      width: 40%;
    }
    &-right {
      width: 60%;
    }
    .dot {
      margin-right: 10px;
    }
    .title {
      color: #666666;
    }
    .data {
      color: #222222;
      font-weight: 500;
    }
    .row-detail-right {
      word-wrap: break-word;
    }
    .row-detail-right .ant-tag {
      margin-top: 0;
      font-size: 14px;
    }

    .button-plus {
      border: 1px solid #e5e5e5;
      background: #ffffff;
      color: #757575;
      .anticon {
        vertical-align: 0.125em;
      }
    }
  }
  .devvn_readmore_taxonomy_flatsome {
    text-align: center;
    cursor: pointer;
    position: absolute;
    z-index: 10;
    bottom: -2px;
    margin-right: auto;
    width: 100%;
    background: #fff;
  }
  .devvn_readmore_taxonomy_flatsome:before {
    height: 55px;
    margin-top: -45px;
    content: "";
    background: -moz-linear-gradient(top, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%);
    background: -webkit-linear-gradient(
      top,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 1) 100%
    );
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%);
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ffffff00', endColorstr='#ffffff',GradientType=0 );
    display: block;
  }
  .devvn_readmore_taxonomy_flatsome .button-show-more {
    color: #180973;
    display: block;
    border-color: #180973;
    margin: auto;
  }
  .modal-des .ant-modal-body {
    padding: 0px;
  }
  .modal-des .des-content {
    overflow: auto;
  }
  .modal-des .ant-tabs-content {
    padding: 24px;
  }
  .product-detail .page-header {
    margin-bottom: 8px;
  }
  #tab .card .ant-card-body {
    padding-top: 0px;
  }
  .variant-prices {
    margin-right: 15px;
    flex-grow: 1;
    flex-shrink: 1;
  }

  .variant-price-container {
    display: flex;
    flex-shrink: 1;
    flex-wrap: wrap;
    margin-top: 30px;
  }

  .variant-price-title {
    font-weight: bold;
  }

  .variant-price-title {
    margin-bottom: 10px;
  }
`;
