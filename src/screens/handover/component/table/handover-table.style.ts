import styled from "styled-components";
import { borderColor } from "utils/global-styles/variables";
const HandoverTableStyle = styled.div`
  th {
    text-align: center !important;
  }
  .ant-table-cell.customer-column,
  .ant-table-cell.products {
    padding: 0px 0px !important;
    .row-item {
      height: 100%;
      padding: 10px;
      display: flex;
      justify-content: space-between;
      &:not(:last-child) {
        border-bottom: 1px solid ${borderColor};
      }
    }
  }
  .center {
    flex-direction: column;
    align-items: center;
  }
  .fulfillment-code-small {
    font-size: 12px;
    font-weight: 400;
  }
`;

export { HandoverTableStyle };
