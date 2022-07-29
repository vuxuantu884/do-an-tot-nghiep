import styled from "styled-components";
import { dangerColor, grayE5Color, grayF5Color } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .exportRequest {
    text-align: right;
  }
  .buttonExportRequest {
    padding: 5px 10px;
    color: ${dangerColor};
    cursor: pointer;
    background: rgba(226, 67, 67, 0.05);
    border: 1px solid ${dangerColor};
    border-radius: 2px;
  }
  .icon {
    margin-right: 5px;
  }
  .isCreate {
    .buttonExportRequest {
      background: ${grayF5Color};
      border: 1px solid ${grayE5Color};
      color: #222;
    }
  }
`;
