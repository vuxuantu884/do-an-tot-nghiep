import styled from "styled-components";
import { borderColor } from "utils/global-styles/variables";

export const StyledConfig = styled.div`
  .shop-column {
    display: flex;
  }

  .ecommerce-user-detail {
    border: 1px solid ${borderColor};
    padding: 7px 15px;
    margin-bottom: 20px;
  }

  label {
    font-weight: 500;
  }
  .description-name {
    display: block;
    line-height: 32px;
    font-weight: 500;
    font-size: 14px;
    color: #222222;
  }
  .description {
    font-weight: 400;
    font-size: 13px;
    color: #666666;
    position: relative;
    padding: 0 20px;
    & > li {
      span {
        padding: 0 10px;
      }
    }
    & > li::marker {
      content: "•";
      font-size: 12px;
      color: #666666;
    }
  }
  .config-setting-footer {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;

    .delete-shop-btn {
      color: red;
      border: 1px solid rgb(226, 67, 67);
      background: #ffffff;
    }
  }

  button {
    display: flex;
    align-items: center;
    img {
      margin-right: 11px;
    }
  }
  #stock_available_min {
    text-align: left !important;
  }
  #stock_available_min::-webkit-input-placeholder {
    text-align: left !important;
  }
`;
