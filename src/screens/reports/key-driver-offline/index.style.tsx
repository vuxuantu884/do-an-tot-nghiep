import color from "assets/css/export-variable.module.scss";
import styled from "styled-components";

export const KeyDriverOfflineStyle = styled.div`
  .ant-table-row-level {
    &-0 {
      td,
      input,
      .input-number {
        background-color: #ffd978 !important;
      }
    }
    &-1 {
      td,
      input,
      .input-number {
        background-color: #ffe5a4 !important;
      }
    }
    &-2 {
      td,
      input,
      .input-number {
        background-color: #fff0c5 !important;
      }
    }
    &-3 {
      td,
      input,
      .input-number {
        background-color: #fff8e2 !important;
      }
    }
    &-4 {
      td,
      input,
      .input-number {
        background-color: #fffdf5 !important;
      }
    }
    &-5 {
      td,
      input,
      .input-number {
        background-color: #ffffff !important;
      }
    }
  }
  .expand-parent {
    td,
    input,
    .input-number {
      background-color: #fff !important;
    }
  }
  .ant-table-thead > tr > th {
    border-bottom: unset;
    white-space: pre-line;
    padding: 4px 16px;
  }

  .department-name {
    cursor: pointer;

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
    padding: 8px 4px;
  }

  .input-cell {
    padding: 0 4px !important;
    white-space: nowrap;
  }

  .input-number {
    border: 1px solid transparent;
    width: 100%;
    &:hover {
      border: 1px solid rgba(24, 144, 255, 0.2);
    }
    &:focus {
      border: 1px solid rgba(24, 144, 255, 0.3);
    }

    input {
      text-align: right;
      width: 100%;
      padding: 0;
    }
  }

  .ant-input-number-handler-wrap {
    display: none;
  }

  .ant-table-content > table > tbody > tr > td {
    padding: 8px 4px;
  }

  .ant-table .ant-table-cell-with-append {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    min-height: 45px;

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

  .pb-2 {
    padding-bottom: 1rem;
  }

  .report-time-desc {
    font-size: 14px;
    text-transform: initial;
    font-weight: normal;
  }

  .ant-input {
    padding: 4px 8px;
  }

  .ant-input-suffix {
    margin-left: 1px;
  }

  .dimension-link {
    color: ${color.white};
  }

  .text-success {
    color: #27ae60;
  }

  .text-danger {
    color: #e24343;
  }

  .ant-table-thead th {
    text-align: center !important;
  }

  .update-target-btn {
    width: 100%;
    height: auto;
    line-height: 16px;
    height: 24px;
    padding: 0 7px;
    font-size: 14px;
    background: #f5f5f5;
    &:hover {
      background: #fff;
    }
  }

  .hidden-row {
    display: none;
  }

  .hidden-button {
    .ant-table-row-expand-icon {
      visibility: hidden;
    }
  }

  .columns-setting {
    right: 20px;
    top: 20px;
    position: absolute;
    .anticon {
      vertical-align: 0.125em;
    }
  }
`;
