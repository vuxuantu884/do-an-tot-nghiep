import { css } from "styled-components";
import { borderColor, headingFontWeight } from "./variables";

const cardPaddingLeftAndRight = "20px";

export const globalCssCustomCard = css`
  .ant-card {
    font-size: 1rem;
    margin-bottom: 20px;
  }
  .ant-card-extra {
    font-size: 1rem;
  }
  .ant-card-head {
    font-size: 1.143rem;
    padding: 12px ${cardPaddingLeftAndRight};
    min-height: 40px;
    border-bottom: 1px solid ${borderColor};
  }
  .ant-card-head-title {
    font-weight: ${headingFontWeight};
    font-size: 1rem;
    line-height: 1.5715;
    text-transform: uppercase;
    position: relative;
    padding: 0;
  }
  .cardNoBody {
    .ant-card-body {
      padding: 0;
    }
  }
  .ant-card-body {
    padding: 20px ${cardPaddingLeftAndRight};
  }
`;
