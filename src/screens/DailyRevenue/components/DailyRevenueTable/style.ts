import styled from "styled-components";
import { primaryColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .ant-table-sticky-scroll-bar {
    border-radius: 12px !important;
    height: 8px;
  }

  .noWrap {
    white-space: nowrap;
  }
  .single {
    margin-top: 2px;
    strong {
      color: #222222;
    }
  }
  .revenueNotes .single {
    height: 50%;
    display: flex;
    padding: 10px;
    -webkit-box-align: center;
    align-items: center;
  }

  .revenueNotes .single:not(:last-child) {
    border-bottom: 1px solid rgb(221, 221, 221);
  }
  td.ant-table-cell.revenueNotes {
    padding: 0px !important;
  }
  .storeName,
  .revenueCode,
  .accountCode {
    font-weight: 500;
  }

  .textSmall {
    font-size: 0.86em;
    line-height: 1.25;
  }
  .text-weight-500 {
    font-weight: 500;
  }
  .mainColor,
  .mainColor a {
    color: ${primaryColor};
  }
  .singlePayment {
    img {
      margin-right: 5px;
    }
    .amount {
      position: relative;
      top: 1px;
      color: #434362;
      font-weight: 400;
    }
  }

  .revenue-payment {
    display: block;
  }
  td.revenue-states {
    color: #ffffff;
    .draft {
      padding: 5px;
      background: #01b0f1;
    }
    .paying {
      padding: 5px;
      background: #fcaf17;
    }
    .paid {
      padding: 5px;
      background: #5656a1;
    }
    .finished {
      padding: 5px;
      background: #27ae60;
    }
  }
  .total-payment {
    /* font-weight: 600; */
    color: #2a2a86;
  }
  .total-cost {
    /* font-weight: 600; */
    color: #2a2a86;
  }
  .other-payment {
    /* font-weight: 600; */
    color: #2a2a86;
  }
  .amount {
    /* font-weight: 600; */
    color: #e24343;
  }
  .remaining-amount {
    color: #000000;
    /* font-weight: 600; */
  }
  .ant-table-body > table > colgroup > col.ant-table-selection-col {
    width: 30px !important;
  }
  .ant-table-thead > tr > th.ant-table-cell.ant-table-selection-column {
    padding: 0px !important;
  }
  td.ant-table-cell.ant-table-selection-column {
    padding: 0px !important;
  }
`;
