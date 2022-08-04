import styled from "styled-components";

export const StyledComponent = styled.div`
  .pack-card .ant-card-body {
    padding-top: 10px;
  }
  /* .pack-success-card .ant-card-head {
    border-bottom: 1px solid #e5e5e5;
    font-size: 1.143rem;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: 16px;
    min-height: 40px;
  } */
  .pack-row {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .ant-form-item {
      box-sizing: border-box;
      padding: 0;
      color: rgba(0, 0, 0, 0.85);
      font-size: 14px;
      font-variant: tabular-nums;
      line-height: 1.5715;
      list-style: none;
      font-feature-settings: "tnum";
      margin: 0px;
      vertical-align: top;
    }
  }
  .pack-row-bottom {
    margin-bottom: 10px;
  }
  .pack-add-hand-over {
    display: flex;
    gap: 20px;
  }
  .input-info-order {
    width: 100%;
  }
  .order-product-pick {
    .ant-table-tbody > tr > td,
    .ant-table-thead > tr > th,
    .ant-table tfoot > tr > td,
    .ant-table tfoot > tr > th {
      position: relative;
      padding: 5px;
      overflow-wrap: break-word;
    }
    .yody-product-pick {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      align-items: center;
      display: flex;
      justify-content: center;
    }
    .btn-do-fast {
      height: 25px;
      width: 25px;
      padding-top: 7px;
      margin: auto;
      background-color: rgb(250, 93, 4);
      border-color: rgb(250, 93, 4);
    }
  }
`;
