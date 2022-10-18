import styled from "styled-components";
import { dangerColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .labelNote {
    font-size: 0.9em;
  }
  .cancelButton {
    color: ${dangerColor};
  }
  .ant-form-item {
    margin-bottom: 15px;
  }
  .ant-row.ant-form-item {
    &.lastItem {
      margin-bottom: 0;
    }
  }
`;
