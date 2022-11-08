import color from "assets/css/export-variable.module.scss";
import styled from "styled-components";

export const KeyDriverStyle = styled.div`
  .ant-table-thead > tr > th {
    border-bottom: unset;
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
    width: 100%;
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
      text-align: right;
      width: 100%;
      padding: 0 2px 0 0;
    }
    .ant-input-suffix {
      margin-left: -2px;
      z-index: 1;
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
      z-index: 1;
    }
  }

  .input-number {
    border: none;
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
    display: flex;
    flex-direction: row;
    justify-content: flex-start;

    .ant-table-row-expand-icon,
    .ant-table-row-expand-icon-expanded {
      margin: 0px;
      min-width: 18px;
    }
    position: absolute !important;
    width: 220px;
    height: 49px;
  }

  .ant-table-row-expand-icon:focus,
  .ant-table-row-expand-icon:hover,
  .ant-table-row-expand-icon:after,
  .ant-table-row-expand-icon:before {
    color: ${color.primary};
  }

  .ant-table-row-level {
    &-0 {
      height: 49px;
      td:first-child {
        background-color: #ffd978 !important;
      }
    }
    &-1 {
      height: 49px;
      td:first-child {
        background-color: #ffe5a4 !important;
      }
    }
    &-2 {
      height: 49px;
      td:first-child {
        background-color: #fff0c5 !important;
      }
    }
    &-3 {
      height: 49px;
      td:first-child {
        background-color: #fff8e2 !important;
      }
    }
    &-4 {
      height: 49px;
      td:first-child {
        background-color: #fffdf5 !important;
      }
    }
    &-5 {
      height: 49px;
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
      background: rgba(245, 245, 245, 1) !important;
    }
  }

  .overflow-wrap-normal {
    overflow-wrap: normal;
    word-break: normal;
  }

  .ant-input-affix-wrapper {
    padding-right: 2px;
  }

  .padding-left-5 {
    padding-left: 5px;
  }
`;
