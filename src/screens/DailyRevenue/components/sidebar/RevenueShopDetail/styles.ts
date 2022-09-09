import styled from "styled-components";
import { primaryColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .rowDetail {
    a {
      font-weight: 500;
      &:hover {
        color: ${primaryColor};
      }
    }
    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }
`;
