import styled from "styled-components";

export const StyledComponent = styled.div`
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
