import styled from "styled-components";

export const StyledComponent = styled.div`
  .preview {
    display: block;
    &.hideEditor {
      .preview__header-title {
        display: none;
      }
    }
    &.showEditor {
      .iconEdit {
        display: none;
      }
    }
    &__header {
      &-inner {
        align-items: center;
        border-bottom: 1px solid #ccc;
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
      }
      &-title {
        font-size: 18px;
        font-weight: bold;
        margin: 0;
      }
      .iconEdit {
        cursor: pointer;
        margin-right: 30px;
      }
    }
    &__content {
      min-height: 500px;
      padding-top: 20px;
    }
  }
  .button {
    &--print {
      border-color: #2a2a86;
      color: #2a2a86;
      .icon {
        display: inline-block;
        margin-right: 5px;
        vertical-align: middle;
      }
    }
  }
`;
