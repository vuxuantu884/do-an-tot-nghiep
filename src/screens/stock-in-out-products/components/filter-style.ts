import styled from "styled-components";

export const FilterStockInOutStyle = styled.div`
  width: 100%;
  padding-bottom: 20px;
  .btn-action {
    display: flex;
    margin-left: auto;
    .ant-form-item:last-child {
      margin-right: 0;
    }
  }
  .ant-form-item {
    flex: auto;
  }
`;

export const StockInOutStatusStyle = styled.div`
  display: flex;
  column-gap: 20px;
  .active,
  .ant-btn:hover {
    color: #ffffff;
    background-color: #2a2a86;
    border-color: #2a2a86;
  }
`;
