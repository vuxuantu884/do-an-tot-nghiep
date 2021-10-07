import styled from "styled-components";
import { borderColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .item.custom-td {
    margin-left: -10px;
    margin-right: -10px;
    padding: 10px 10px;
    display: flex;
    align-items: center;
    &:not(:last-child) {
      border-bottom: 1px solid ${borderColor};
    }
    p {
      margin-bottom: 0;
    }
    .quantity {
      margin-left: 15px;
      white-space: nowrap;
    }
  }
`;
