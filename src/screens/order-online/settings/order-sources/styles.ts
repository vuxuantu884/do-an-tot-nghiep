import styled from "styled-components";

export const StyledComponent = styled.div`
  .ant-table-tbody {
    td {
      white-space: nowrap;
    }
    tr {
      cursor: pointer;
    }
    .text {
      display: block;
      max-width: 375px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      word-wrap: break-word;
      word-break: break-word;
      @media screen and (min-width: 1600px) {
        max-width: 600px;
      }
    }
  }
  .columnTitle {
    .title {
      display: block;
      font-size: 1em;
    }
  }
`;
