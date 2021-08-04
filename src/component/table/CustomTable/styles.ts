import styled from "styled-components";

export const StyledComponent = styled.div`
  .ant-table-tbody {
    tr {
      cursor: pointer;
    }
  }
  .columnTitle {
    .title {
      display: block;
      font-size: 1em;
      max-width: 600px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
`;
