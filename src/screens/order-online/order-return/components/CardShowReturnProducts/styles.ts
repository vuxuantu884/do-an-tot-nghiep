import styled from "styled-components";

export const StyledComponent = styled.div`
  .ant-card-body {
    padding: 24px;
  }
  .label {
    margin-bottom: 15px;
  }
  .productSearchInput {
    width: 100%;
    margin-bottom: 35px;
  }
  .ant-select-item {
    height: auto;
  }
  .boxPayment {
    padding-top: 20px;
    .ant-row {
      &:not(:last-child) {
        margin-bottom: 10px;
      }
    }
  }
  .columnQuantity {
    text-align: center;
  }
  .ant-table-tbody>tr>td {
    padding: 8px;
  }
  .yody-pos-varian-name {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
`;
