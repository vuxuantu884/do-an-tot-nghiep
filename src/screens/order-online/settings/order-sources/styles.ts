import styled from "styled-components";
import {dangerColor, successColor} from "utils/global-styles/variables";

export const StyledComponent = styled.div`
    .cardExtra {
      button {
        &:not(:last-child) {
          margin-right: 5px;
        }
      }
    }
  .page-filter {
    padding-top: 0;
  }
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
      word-wrap: break-word;
      white-space: nowrap;
      text-overflow: ellipsis;
      max-width: 300px;
      overflow: hidden;
    }
  }
  .status {
    display: inline-block;
    border-radius: 100px;
    white-space: nowrap;
    height: 24px;
    margin-top: 6px;
    line-height: 24px;
    padding: 0 5px;
    min-width: 110px;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.857rem;
    &.active {
      background: #f0fcf5;
      color: ${successColor};
    }
    &.inactive {
      background: rgba(226, 67, 67, 0.1);
      color: ${dangerColor};
    }
  }
  .custom-table .ant-table.ant-table-middle .ant-table-thead{
    box-shadow: unset
  }
`;
