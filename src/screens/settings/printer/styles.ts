import styled from "styled-components";
import IconSearch from "./images/iconSearch.svg";

export const StyledComponent = styled.div`
  .searchWrapper {
    margin-bottom: 35px;
    .searchForm {
      display: flex;
      align-items: center;
    }
    .ant-input {
      background-image: url(${IconSearch});
      background-repeat: no-repeat;
      background-position: 12px 50%;
      text-indent: 20px;
    }
    .formInput {
      width: 100%;
    }
    .ant-form-item {
      margin-bottom: 0;
    }
  }
  .columnAction {
    .icon {
      display: inline-block;
      vertical-align: middle;
      margin-right: 5px;
    }
    &__singleButton {
      &:not(:last-child) {
        margin-right: 10px;
      }
      &--edit {
        color: #222;
        .ant-btn {
          color: inherit;
        }
      }
      &--print {
        border-color: #2a2a86;
        color: #2a2a86;
      }
    }
  }
  .printSize {
    text-transform: uppercase;
  }
  .custom-table {
    tr {
      cursor: pointer;
      &:hover {
        color: #2a2a86;
      }
    }
  }
`;
