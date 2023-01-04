import styled from "styled-components";

export const StyledComponent = styled.div`
  span.ant-input-group.ant-input-group-lg.discount-group {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-content: center;
  }

  .table-discount {
    margin-top: 10px;
    .row-item-value {
      font-weight: 500;
      color: #262626;
    }
    .row-item-value-after {
      font-weight: 500;
      color: #52c41a;
    }
    .ant-table-tbody > tr > td {
      padding: 3px 16px;
      button {
        height: 32px;
      }
    }
    .ant-table-thead > tr > th {
      padding: 6px 16px;
    }
  }
  .row-discount-input {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    .input-discount-coupon {
      width: calc(100% - 100px);
    }
    button {
      width: 88px;
    }
  }
`;
