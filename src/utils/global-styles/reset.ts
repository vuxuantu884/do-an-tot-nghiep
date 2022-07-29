import { css } from "styled-components";
import { bodyFontSize, primaryColor, textBodyColor, textLinkColor } from "./variables";
const scrollBarThumb = "#c1c1c1";
const scrollBarColor = "#f1f1f1";

export const reset = css`
  * {
    margin: 0;
    padding: 0;
    scrollbar-color: ${scrollBarThumb} ${scrollBarColor};
    scrollbar-width: thin;
  }
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .ant-table-sticky-scroll {
    opacity: 1;
  }
  ::-webkit-scrollbar-thumb,
  .ant-table-sticky-scroll-bar {
    background: ${scrollBarThumb};
  }
  .ant-table-sticky-scroll-bar {
    border-radius: 5px;
  }
  ::-webkit-scrollbar-track {
    background: ${scrollBarColor};
  }
  html {
    font-size: ${bodyFontSize};
  }
  body {
    font-family: "Roboto", "Arial", sans-serif;
    color: ${textBodyColor};
    word-break: break-word;
  }
  a {
    color: ${textLinkColor};
    &:hover {
      color: ${primaryColor};
    }
  }
  ul {
    padding-left: 15px;
  }
`;
