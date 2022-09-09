import styled from "styled-components";
import { grayF5Color } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .colTitle {
    margin-bottom: 6px;
    font-weight: 500;
  }
  .singleRow {
    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }
  .iconEdit {
    margin-right: 5px;
    cursor: pointer;
    color: rgb(42, 42, 134);
  }
  .orders-tag {
    background-color: ${grayF5Color};
    color: #737373;
    padding: 5px 10px;
  }
  .text-focus {
    word-wrap: break-word;
  }
`;
