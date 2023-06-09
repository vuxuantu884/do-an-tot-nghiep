import styled from "styled-components";
import IconSearch from "./images/iconSearch.svg";

export const StyledComponent = styled.div`
  .searchWrapper {
    .searchForm {
      margin-bottom: 20px;
    }
    .ant-input {
      background-image: url(${IconSearch});
      background-position: 12px 50%;
      background-repeat: no-repeat;
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
      img {
        margin-right: 5px;
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
