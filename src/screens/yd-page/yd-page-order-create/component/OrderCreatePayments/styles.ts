import styled from "styled-components";

export const StyledComponent = styled.div`
  .order-cod-payment-footer {
    margin-top: 15px;
    border-radius: 5px;
    border: 1px solid #2a2a86;
    height: 54px;
    background-color: #f8f8ff;
    padding: 0 19px;
    display: flex;
    align-items: center;
    & > span {
      size: 14px;
      line-height: 54px;
      letter-spacing: 0.2px;
      color: #2a2a86;
      span {
        font-weight: 500;
      }
    }
    & > div {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 54px;
      height: 54px;
      margin-right: 12px;
      & > div {
        border: 1px solid #2a2a86;
        border-radius: 50%;
        div {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: #2a2a86;
          border: 2px solid white;
          border-radius: 50%;
          img {
          }
        }
      }
    }
  }

  .ant-card-head {
    border-bottom: none;
  }
  
  .orders-timeline .ant-collapse-item {
    &::before, &::after {
      display: none;
    }
  }
  
  .orders-timeline .ant-collapse-header {
    display: none;
  }

  .ant-collapse-content-box {
    padding: 0 !important;
  }

  .btn-payment-method {
    padding: 0 !important;
    margin-top: 8px;

    & .ant-btn {
      display: flex;
      height: 22px !important;
      line-height: 20px !important;
      padding: 0;
      margin-left: 12px;
      border: none;
      box-shadow: none;
    }

    .ant-btn-primary {
      border: 1px solid #2a2a86 !important;
    }

    .ant-btn-default.active,
    .ant-btn-default:focus,
    .ant-btn-default:hover {
      color: unset !important;
      background-color: unset !important;
    }
  }

  .hide-number-handle .ant-input-number-input-wrap > input {
    height: 32px;
  }

`;
