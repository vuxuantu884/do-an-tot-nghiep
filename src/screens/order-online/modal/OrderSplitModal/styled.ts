import styled from "styled-components";

export const StyledComponent = styled.div`
  .selected-store {
    margin-bottom: 10px;
  }
  .ant-card-head button {
    margin-left: 10px;
  }
  .table-order-split {
    .ant-table-tbody > tr > td {
      padding: 6px;
      font-size: 12px;
      .anticon {
        font-size: 18px;
        padding-top: 4px;
      }
    }
    .ant-btn {
      height: 30px;
    }
    .ant-input {
      height: 30px;
    }
    .product-name {
      .sku {
        color: #2a2a86;
      }
      .variant {
      }

      .discount-item {
        color: rgb(39, 174, 96);
        font-style: normal;
        font-weight: 500;
        font-size: 12px;
        line-height: 20px;
        display: flex;
        -webkit-box-pack: start;
        justify-content: flex-start;
      }
    }
  }
`;
