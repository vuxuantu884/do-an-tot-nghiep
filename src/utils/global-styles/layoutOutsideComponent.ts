import { css } from "styled-components";

export const globalCssLayoutOutsideComponent = css`
  .searchDropdown__productTitle {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    max-height: 42px;
    line-height: 21px;
  }
`;
