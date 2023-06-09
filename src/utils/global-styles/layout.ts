import { css } from "styled-components";

export const globalCssLayout = css`
  .ant-layout-content {
    padding: 0 20px;
    padding-top: 55px;
    padding-bottom: 55px;
    &.collapsed {
      display: block;
      .bottomBar {
        left: ${52 + 20}px;
      }
    }
  }
`;
