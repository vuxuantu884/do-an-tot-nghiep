import { css } from "styled-components";
import { borderColor, headingFontWeight } from "./variables";

const cardPaddingLeftAndRight = "20px";

export const globalCssCustomCard = css`
  .ant-card {
    margin-bottom: 20px;
  }
  .ant-card-head {
    padding: 9px ${cardPaddingLeftAndRight};
    min-height: 40px;
    border-bottom: 1px solid ${borderColor};
  }
  .ant-card-head-title {
    font-weight: ${headingFontWeight};
    font-size: 0.875rem;
    line-height: 1.5715;
    text-transform: uppercase;
    position: relative;
    padding: 0;
  }
  .ant-card-body {
    padding: 20px ${cardPaddingLeftAndRight};
  }
`;
