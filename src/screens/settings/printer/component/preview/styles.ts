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
      &-title {
        font-weight: bold;
        font-size: 1em;
        margin: 0;
      }
    }
    &__content {
      padding-top: 30px;
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
  @page {
    /* size: 80mm 50mm; */
    margin: 20mm;
  }

  @media all {
    .pagebreak {
      display: none;
    }
  }

  @media print {
    .pagebreak {
      page-break-before: always;
    }
  }
`;
