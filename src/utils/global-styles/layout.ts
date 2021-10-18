import { css } from "styled-components";

export const globalCssLayout = css`
  .ant-layout-content {
    padding: 0 20px;
    padding-top: 55px;
    padding-bottom: 55px;
  }
  .searchDropdown__productTitle {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    height: 42px;
    line-height: 21px;
  }
`;
