import styled from "styled-components";

export const StyledComponent = styled.div`
  .filter {
    .action-dropdown {
      width: 110px;
      margin-right: 10px;
      .action-button {
        padding: 6px 15px;
        border-radius: 5px;
        display: flex;
        align-items: center;
        color: $primary-color;
        &:hover {
          color: $primary-color;
          border: 1px solid $primary-color;
          color: $primary-color;
        }
      }
    }
  }

  .ecommerce-product-action-column {
    text-align: center;
  }
`;
