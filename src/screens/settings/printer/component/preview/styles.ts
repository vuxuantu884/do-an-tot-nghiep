import styled from "styled-components";

export const StyledComponent = styled.div`
  .preview {
    display: block;
    &__header {
      &-inner {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 108px;
        border-bottom: 1px solid #ccc;
      }
      &-title {
        font-weight: bold;
        font-size: 18px;
        margin: 0;
      }
    }
    &__content {
      /* padding-top: 30px; */
    }
  }
  .button {
    &--print {
      border-color: #2a2a86;
      color: #2a2a86;
      .icon {
        display: inline-block;
        vertical-align: middle;
        margin-right: 5px;
      }
    }
  }
`;
