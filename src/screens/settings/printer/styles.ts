import styled from "styled-components";

export const StyledComponent = styled.div`
  .columnAction {
    .icon {
      display: inline-block;
      vertical-align: middle;
      margin-right: 5px;
      &--hover {
        display: none;
      }
      &--normal {
        display: block;
      }
    }
    &__singleButton {
      &:hover {
        .icon {
          &--hover {
            display: block;
          }
          &--normal {
            display: none;
          }
        }
      }
      &:not(:last-child) {
        margin-right: 5px;
      }
    }
  }
`;
