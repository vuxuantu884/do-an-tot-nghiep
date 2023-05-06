import { ANT_PREFIX_CLS } from "./../../../utils/Constants";
import styled from "styled-components";

export const CreateBinLocationWrapper = styled.div`
  .form-search {
    display: flex;
  }
  .import-btn {
    margin-left: 15px;
  }
  .inventory-table {
    margin-top: 20px;
  }
  .form-account {
    display: flex;
    margin-top: 20px;
    &-label {
      margin-right: 8px;
      padding-top: 8px;
      font-weight: 500;
    }
  }
  .${ANT_PREFIX_CLS}-empty {
    font-weight: 500;
    color: rgba(0, 0, 0, 0.5);
  }
  .${ANT_PREFIX_CLS}-empty-footer {
    display: flex;
    justify-content: center;
    .list-icon {
      font-size: 10px;
      color: rgb(176, 176, 242);
      margin-right: 7px;
    }
    .short-cut-key {
      color: rgb(176, 176, 242);
      font-size: 16px;
      font-weight: bold;
    }
  }
  .input-group {
    display: flex;
    align-items: center;
    text-align: center;
    height: 100%;
    &-number {
      width: 60%;
    }
    &-btn {
      width: 20%;
      border: 1px solid #d9d9d9;
      height: 36px;
      line-height: 34px;
      cursor: pointer;
    }
  }
  .${ANT_PREFIX_CLS}-table-summary > tr > td {
    border: none;
  }
  .border-none {
    border: none !important;
  }
  .back-btn {
    cursor: pointer;
    display: flex;
    align-items: center;
    &-icon {
      margin-right: 10px;
    }
  }
  .product-item-delete {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    padding: 0;
    margin: auto;
    background-color: transparent;
    border: none;
    color: #222222;
    box-shadow: none;
    &:hover {
      background-color: rgba(#2a2a86, 0.15);
    }
  }
  .delete-all {
    font-weight: 500;
    cursor: pointer;
    color: #ff4d4f;
    text-decoration: underline;
  }
`;
