import color from "assets/css/export-variable.module.scss";
import styled from "styled-components";

export const KeyDriverOnlineStyle = styled.div`
  .ant-table-thead > tr > th {
    border-bottom: unset;
    white-space: pre-line;
    padding: 4px 16px;
  }

  .department-name {
    cursor: pointer;

    &--primary {
      background-color: ${color.primary} !important;
      color: ${color.white};
    }

    &--secondary {
      background-color: ${color.secondary} !important;
      color: ${color.white};
    }
  }

  .method-cell {
    padding: 0 4px !important;
  }
  .key-cell {
    height: 100%;
    width: 100%;
    cursor: help;
  }
  .method {
    font-size: 12px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    text-transform: uppercase;
  }

  .ant-table-cell {
    /* height: 56px; */
    padding: 0;
  }

  .input-cell {
    padding: 0 4px !important;
  }

  .input-number {
    border: none;
    width: 100%;

    input {
      text-align: right;
      width: 100%;
      padding: 0 5px 0 0;
    }
  }

  .ant-input-number-handler-wrap {
    display: none;
  }

  .ant-table-content > table > tbody > tr > td {
    /* padding-right:  4px;
    padding-left:  4px; */
    padding: 8px 4px;
  }

  .ant-table .ant-table-cell-with-append {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;

    .ant-table-row-expand-icon,
    .ant-table-row-expand-icon-expanded {
      margin-right: 10px;
      min-width: 18px;
    }
  }

  .ant-table-row-expand-icon:focus,
  .ant-table-row-expand-icon:hover,
  .ant-table-row-expand-icon:after,
  .ant-table-row-expand-icon:before {
    color: ${color.primary};
  }

  .ant-table-row-level-1 {
    td,
    input {
      background-color: aliceblue !important;
    }
  }

  .ant-table-row-level-0 {
    td,
    input {
      background-color: antiquewhite !important;
    }
  }

  .ant-table-row-level-2 {
    td,
    input {
      background-color: #fff !important;
    }
  }

  .pb-2 {
    padding-bottom: 1rem;
  }
  .disable-table-style {
    .ant-table-row-level-0 {
      td,
      input {
        background-color: #fff !important;
      }
    }
  }
`;
