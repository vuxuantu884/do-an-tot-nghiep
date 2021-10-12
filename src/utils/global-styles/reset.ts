import { css } from "styled-components";

export const reset = css`
  * {
    margin: 0;
    padding: 0;
    scrollbar-color: rgba(79, 104, 125, 0.4) #999;
    scrollbar-width: thin;
  }
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .ant-table-sticky-scroll-bar {
    border-radius: 5px;
  }
  ::-webkit-scrollbar-track,
  ::-webkit-scrollbar-thumb,
  .ant-table-sticky-scroll-bar {
    background: rgba(79, 104, 125, 0.4);
  }
`;
