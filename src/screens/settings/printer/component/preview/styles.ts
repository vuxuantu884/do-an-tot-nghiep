import styled from "styled-components";

export const StyledComponent = styled.div`
  .preview {
    display: block;
    &__header {
      &-inner {
        padding-bottom: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #ccc;
      }
    }
    &__content {
      padding-top: 30px;
    }
  }
`;
