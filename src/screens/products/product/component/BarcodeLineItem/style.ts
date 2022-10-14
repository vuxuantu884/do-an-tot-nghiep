import styled from "styled-components";

export const StyledComponent = styled.div`
  .bc-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 6px 12px;
    background: #ffffff;
    border-bottom: 1px solid #f5f5f5;
    &-image {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 3px;
      background-color: #f2f2f2;
      img {
        max-width: 40px;
        max-height: 40px;
        border-radius: 3px;
      }
    }
    &-info {
      width: 100%;
      display: flex;
      flex-direction: row;
      margin-left: 10px;
      &-left {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      &-right {
        display: flex;
        flex-direction: column;
        text-align: right;
        justify-content: center;
        width: 150px;
      }
    }
    &-name {
      font-size: 14px;
      color: #222222;
      line-height: 18px;
    }
    &-sku {
      margin-top: 5px;
      font-size: 12px;
      line-height: 18px;
      color: #737373;
    }
    &-price {
      font-size: 14px;
      color: #222222;
      line-height: 18px;
      .currency {
        font-size: 12px;
        line-height: 14px;
        color: #737373;
      }
    }
    &-inventory {
      font-size: 12px;
      line-height: 18px;
      .value {
        color: $primary-color;
      }
    }
    &:hover {
      background-color: #f7f7ff;
    }
  }
`;
