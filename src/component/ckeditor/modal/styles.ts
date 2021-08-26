import styled from "styled-components";

export const StyledComponent = styled.div`
  section {
    margin-bottom: 35px;
  }
  .ant-table {
    td {
      word-break: break-word;
    }
    .ant-table-tbody {
      tr {
        cursor: pointer;
      }
    }
  }
  .modal__title {
    &--big {
      font-size: 20px;
    }
    &--small {
      font-style: italic;
    }
  }
  .title {
    text-align: center;
    font-size: 20px;
    margin-bottom: 20px;
  }
  .sectionSearch {
  }
  .boxListKeywords {
    padding-top: 35px;
    max-height: calc(100vh - 450px);
    overflow-x: hidden;
    overflow-y: auto;
  }
`;
