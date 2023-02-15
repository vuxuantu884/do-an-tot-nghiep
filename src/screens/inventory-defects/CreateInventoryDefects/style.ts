import styled from "styled-components";

export const InventoryDefectWrapper = styled.div`
  .product-table-row .ant-form-item-explain {
    position: absolute;
    top: 100%;
    font-size: 12px;
  }
  .ant-form-item {
    margin: 0px;
  }
  .product-item-delete {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    border: none;
    color: #222222;
    box-shadow: none;
    &:hover {
      background-color: rgba(#2a2a86, 0.15);
    }
  }
`;
