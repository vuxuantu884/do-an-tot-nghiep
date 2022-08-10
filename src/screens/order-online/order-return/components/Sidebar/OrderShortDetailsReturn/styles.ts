import styled from "styled-components";
import { primaryColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .rowDetail {
    &:not(:last-child) {
      margin-bottom: 10px;
    }
    a {
      font-weight: 500;
      color: ${primaryColor};
    }
  }
  .breakWord {
    word-wrap: break-word;
  }
`;
