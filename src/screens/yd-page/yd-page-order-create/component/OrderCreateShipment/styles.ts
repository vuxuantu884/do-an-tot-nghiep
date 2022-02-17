import styled from "styled-components";
import { primaryColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .saleorder_shipment_method-heading {
    font-weight: 600;
    margin-top: 12px;
  }

  .saleorder_shipment_method_btn {
    display: flex;
    align-items: center;
    width: 100%;
    height: auto;
    margin: 0;
    border-bottom: 1px solid ${primaryColor};
  }
  .orders-shipment {
    .ant-row {
      /* justify-content: space-between; */
    }
    &__dateLabel {
      float: left;
      line-height: 40px;
      margin-right: 10px;
    }
    .ant-form-item {
      margin-bottom: 20px;
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  .formInputAmount {
    color: #222;
    text-align: right;
    width: 100%;
  }
  .saleorder_shipment_button {
    border: none;
    padding: 8px 10px;
    border-radius: 3px;
    cursor: pointer;
    flex: 1;
    margin-bottom: -1px;
    transition: border 0.3s ease;
    img {
      margin-right: 8px;
      width: 18px;
      height: 18px;
    }
    &.border {
      border: 1px solid ${primaryColor};
      span {
        color: #2a2a86;
      }
      img {
        filter: invert(15%) sepia(39%) saturate(2000%) hue-rotate(200deg) brightness(66%)
          contrast(100%);
      }
    }
    &.active {
      border-bottom: 2px solid ${primaryColor};
      border-radius: 3px 3px 0 0;
      background-color: white;
      padding-bottom: 10px;
      span {
        color: ${primaryColor};
      }
    }
  }
  .ant-btn-default.active, .ant-btn-default:focus, .ant-btn-default:hover {
    color: unset !important;
    background-color: unset !important;
    border-color: unset !important;
  }

  .orders-shipment {
    & .ant-form-item {
      flex-direction: column !important;
    }
  }

`;
