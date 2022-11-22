import color from "assets/css/export-variable.module.scss";
import styled from "styled-components";

export const KeyDriverStyle = styled.div`
  .ant-table {
    color: #262626;
    font-weight: 500;
    font-size: 12px;
    .ant-table-body {
      border-top: 1px solid #d9d9d9;
      padding-bottom: 14px;
      table > tbody > tr > td {
        border-right: 1px solid #d9d9d9 !important;
        border-bottom: 1px solid #d9d9d9 !important;
      }
    }
  }
  .ant-table-thead > tr > th {
    border-right: 1px solid #d9d9d9 !important;
    border-bottom: 1px solid #d9d9d9 !important;
    white-space: pre-line;
  }

  .department-name {
    cursor: pointer;
    a {
      color: ${color.white};
    }
    &--primary {
      background-color: rgba(42, 42, 134, 1) !important;
      color: ${color.white};
    }

    &--secondary {
      color: ${color.white};
      &:nth-child(odd) {
        background-color: rgba(60, 60, 185, 1) !important;
      }
      &:nth-child(even) {
        background-color: rgba(92, 92, 227, 1) !important;
      }
    }
  }

  .ant-btn-icon-only.ant-btn-sm:hover {
    background-color: #f5f5f5 !important;
    transition: 0.1s;
  }

  .method-cell {
    padding: 0 4px !important;
  }
  .key-cell {
    height: 100%;
    cursor: help;
    // min-height: 30px;
    display: flex;
    justify-content: left;
    align-items: center;
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
    padding: 2px 2px;
  }

  .input-cell {
    padding: 0px !important;
    input {
      color: #262626;
      font-weight: 500;
      font-size: 12px;
      text-align: right;
      width: 100%;
      padding: 0 2px 0 0;
    }
    .ant-input-suffix {
      margin-left: -2px;
      z-index: 0;
    }
    .btn-cancel-input {
      background-color: #fff;
      color: #2a2a86;
      .anticon {
        vertical-align: 0.25em;
        font-size: 16px;
      }
    }
    .btn-ok-input {
      margin-left: 5px;
      color: #fff;
      background-color: #2a2a86;
      .anticon {
        vertical-align: 0.25em;
        font-size: 16px;
      }
    }
    .btn-ok-input:hover {
      color: #fff !important;
      background-color: #2a2a86 !important;
    }
  }

  .non-input-cell {
    padding: -1px 13px !important;
    input {
      text-align: right;
      width: 100%;
      padding: 0 2px 0 0;
    }
    .ant-input-suffix {
      margin-left: -2px;
      z-index: 0;
    }
  }

  .input-number {
    width: 100%;
    height: auto;
    .ant-input {
      height: auto;
    }
  }

  .ant-input-number-handler-wrap {
    display: none;
  }

  .ant-table-content > table > tbody > tr > td {
    /* padding-right:  4px;
    padding-left:  4px; */
    padding: 2px 2px;
  }

  .ant-table .ant-table-cell-with-append {
    display: table-cell;
    // flex-direction: row;
    // justify-content: flex-start;

    // .ant-table-row-expand-icon,
    // .ant-table-row-expand-icon-expanded {
    //   margin: 0px;
    //   min-width: 18px;
    // }
  }

  .ant-table-row-expand-icon:focus,
  .ant-table-row-expand-icon:hover,
  .ant-table-row-expand-icon:after,
  .ant-table-row-expand-icon:before {
    color: ${color.primary};
  }

  .ant-table-row-level {
    &-0 {
      td:first-child {
        background-color: #ffd978 !important;
      }
    }
    &-1 {
      td:first-child {
        background-color: #ffe5a4 !important;
      }
    }
    &-2 {
      td:first-child {
        background-color: #fff0c5 !important;
      }
    }
    &-3 {
      td:first-child {
        background-color: #fff8e2 !important;
      }
    }
    &-4 {
      td:first-child {
        background-color: #fffdf5 !important;
      }
    }
    &-5 {
      td:first-child {
        background-color: #ffffff !important;
      }
    }
  }
  .expand-parent {
    td:first-child {
      background-color: #fff !important;
    }
  }

  .pb-2 {
    padding-bottom: 1rem;
  }

  .background-red {
    background-color: #fff1f0;
    color: #cf1322;
    border-radius: 2px;
  }
  .background-green {
    background-color: #f6ffed;
    color: #389e0d;
    border-radius: 2px;
  }
  .columns-setting {
    right: 20px;
    top: 20px;
    position: absolute;
    .anticon {
      vertical-align: 0.125em;
    }
  }

  .ant-table-thead th {
    text-align: center !important;
  }

  tbody > tr:hover {
    td,
    td:first-child,
    input,
    .input-number,
    .ant-input-affix-wrapper {
      background: #eee !important;
    }
  }

  .overflow-wrap-normal {
    overflow-wrap: normal;
    word-break: normal;
    min-width: 40px;
  }

  .ant-input-affix-wrapper {
    padding-right: 2px;
  }

  .padding-left-5 {
    padding-left: 5px;
  }

  .key-driver-header {
    cursor: pointer;
    a {
      color: #000 !important;
    }
  }

  .deparment-name-horizontal {
    color: #000;
    padding-left: 0.25rem;
  }

  .ant-table-row-expand-icon-spaced {
    margin-right: 0 !important;
  }

  .d-flex {
    display: flex;
  }

  .justify-content {
    &-between {
      justify-content: space-between;
    }
  }

  .align-items {
    &-center {
      align-items: center;
    }
  }

  .btn-setting {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .ant-card-body {
    padding: 16px 16px;
  }

  .ant-form-item {
    margin: 0;
  }

  .filter-block {
    &-title {
      padding-right: 0.5rem;
      text-align: center;
    }
    &-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    &__direction .ant-card-body {
      line-height: 38px;
    }
  }
`;
