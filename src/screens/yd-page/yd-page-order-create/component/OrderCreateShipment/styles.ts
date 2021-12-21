import styled from "styled-components";
import { primaryColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .saleorder_shipment_method_btn {
    display: flex;
    align-items: center;
    width: 100%;
    height: auto;
    margin: 20px 0 0 0;
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
    border: 1px solid #e5e5e5;
    padding: 8px 10px;
    border-radius: 3px;
    cursor: pointer;
    flex: 1;
    margin-bottom: -1px;
    transition: border 0.3s ease;
    &:hover {
      border: 1px solid ${primaryColor};
    }
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
      border: 1px solid ${primaryColor};
      border-bottom: none;
      border-radius: 3px 3px 0 0;
      background-color: white;
      padding-bottom: 10px;
      span {
        color: ${primaryColor};
      }
    }
  }
`;
