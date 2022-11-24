import styled from "styled-components";

export const StyledComponent = styled.div`
  .page-filter {
    padding: 0;
    &-left {
      margin-right: 20px;
    }
    &-right {
      display: flex;
      flex-direction: row;
      width: 100%;
      .input-search {
        width: 100%;
        margin-right: 10px;
      }
    }
  }
  .view-table {
    margin-top: 20px;
  }
  .pack-card-orders {
    .ant-card-head-title {
      display: flex;
      justify-content: space-between;
      &-quantity-fulfillment {
        color: red;
      }
    }
    .ant-card-body {
    }
  }
  .pack-card-products {
    .ant-card-body {
      padding-bottom: 0;
    }
  }
`;
