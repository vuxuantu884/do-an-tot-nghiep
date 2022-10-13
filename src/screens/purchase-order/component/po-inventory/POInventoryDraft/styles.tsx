import styled from "styled-components";

export const POInventoryDraftTable = styled.div`
  position: relative;
  .product-item-image {
    img {
      max-width: 40px;
      max-height: 40px;
      border-radius: 3px;
    }
  }

  .ant-select {
    width: 100%;
    font-weight: 400;
    text-align: left;
  }

  .ant-picker {
    width: 100%;
  }

  .ant-input-number {
    width: 100%;
  }

  .ant-input-number-handler-wrap {
    display: none;
  }
  p {
    margin-bottom: 0;
  }
`;

export const ActionsTableColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  span.anticon {
    height: 40px;
    width: 40px;
    padding: 5px;
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &.anticon-plus {
      border: 1px solid #2a2a86;
    }

    &.anticon-minus {
      border: 1px solid #ff4d4f;
    }
  }

  &.group_actions {
    right: 33px;
    top: 15px;

    span.anticon {
      height: 30px;
      width: 30px;
      margin: 5px;
    }
  }
`;
