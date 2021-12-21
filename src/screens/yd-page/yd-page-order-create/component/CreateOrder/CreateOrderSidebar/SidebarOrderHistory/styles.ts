import styled from "styled-components";
import { borderColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .ant-row {
    &:not(:last-child) {
      padding-bottom: 8px;
      margin-bottom: 12px;
      border-bottom: 1px solid ${borderColor};
    }
  }
`;
