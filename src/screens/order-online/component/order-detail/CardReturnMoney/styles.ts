import styled from "styled-components";
import { successColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .ant-timeline-item-last > .ant-timeline-item-tail {
    display: block;
  }
  .ant-timeline-item-head {
    background: #27ae60;
  }
  .orders-tag-success {
    background-color: rgba(39, 174, 96, 0.1);
    color: ${successColor};
  }
  .timeline {
    &__colAmount {
      text-align: center;
    }
    &__colDate {
      text-align: right;
    }
  }
  .returnToCustomer {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
  }
`;
