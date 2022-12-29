import styled from "styled-components";
import { dangerColor, primaryColor, successColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .discount-item {
    color: ${successColor};
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 20px;
    display: flex;
    justify-content: flex-start;
    img {
      margin-right: 2px;
    }
  }
  .promotionName {
    color: ${primaryColor} !important;
    img {
      margin-right: 2px;
      position: relative;
      top: -2px;
    }
  }
  .secondaryValue {
    color: ${dangerColor};
    font-size: 0.857em;
    margin-left: 3px;
  }
  .totalAmount {
    color: ${primaryColor};
  }
`;
