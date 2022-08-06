import styled from "styled-components";
import { textBodyColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  z-index: 1;
  .storeInformation {
    margin-top: 20px;
  }
  .row-info {
    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }
  .row-info-content {
    a {
      color: ${textBodyColor};
    }
  }
`;
