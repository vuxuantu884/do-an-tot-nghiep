import styled from "styled-components";

export const StyledComponent = styled.div`
  .ant-card-body {
    padding-top: 0;
  }

  td {
    white-space: nowrap;
  }
  .ant-table-tbody {
    tr {
      cursor: pointer;
    }
    .text {
      display: block;
      max-width: 375px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      word-break: break-word;
      word-wrap: break-word;
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
