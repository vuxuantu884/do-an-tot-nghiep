import styled from "styled-components";

export const StyledComponent = styled.div`
  .card-promotion {
    position: absolute;
    top: 2;
    right: -55px;
    width: 600px;
    z-index: 1000;
    border-radius: 10px;
    box-shadow: 0 0 2px 1px #eee;
    .ant-card-head {
      padding: 6px 20px;
      min-height: 35px;
      background: #f0f0f0;
      .ant-card-head-title {
        width: 100%;
        display: flex;
        padding-top: 3px;
        text-transform: capitalize;
        font-weight: 400;
        font-size: 12px;
        line-height: 20px;
        .title-promotion-close {
          font-size: 18px;
          color: #595959;
          width: 20%;
          text-align: right;
        }
        .title-promotion-close:hover {
          color: red;
        }

        .title-promotion-name {
          width: 40%;
          text-align: left;
          color: #595959;
          display: flex;
          span {
            line-height: 18px;
          }
        }
        .title-promotion-before {
          width: 20%;
          text-align: center;
          color: #595959;
        }
        .title-promotion-after {
          width: 20%;
          text-align: center;
          color: #595959;
        }
      }
    }

    .ant-card-body {
      padding: 10px 0px 20px;
      .row-item {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        width: 100%;
        line-height: 38px;
        padding: 6px 20px;
        border-bottom: 1px solid #ddd;
        &-name {
          width: 40%;
          text-align: left;
          color: #262626;
          display: flex;
          span {
            line-height: 18px;
          }
          img {
            margin-right: 5px;
            width: 18px;
          }
        }
        &-value-before {
          width: 20%;
          text-align: center;
          color: #262626;
          font-weight: 500;
        }
        &-value-after {
          width: 20%;
          text-align: center;
          color: #52c41a;
          font-weight: 500;
        }
        &-apply {
          width: 20%;
          text-align: right;
          .ant-btn {
            height: 30px;
            /* line-height: 30px; */
          }
        }
      }
    }
  }

  .card-error-notfount {
    position: absolute;
    top: 2;
    top: 44px;
    right: 6px;
    width: 200px;
    z-index: 1000;
    border-radius: 10px;
    box-shadow: 0 0 2px 1px #eee;
    background: #eee;
    color: red;
  }
  .input {
    padding: 7px 27px 4px 14px;
  }
  .close-discount-item {
    position: absolute;
    top: 12px;
    right: 54px;
    z-index: 1;
    cursor: pointer;
  }
  .load-coupon-discount-item {
    position: absolute;
    top: 12px;
    right: 54px;
    z-index: 1;
    cursor: pointer;
  }
`;
