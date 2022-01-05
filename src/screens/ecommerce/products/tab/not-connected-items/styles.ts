import styled from "styled-components";

export const StyledComponent = styled.div`
  .delete-item-icon {
    cursor: pointer;
    width: 26px;
    &:hover {
      border: 1px solid #5c5c5c;
    }
  }

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
`;

export const StyledYodyProductColumn = styled.div`
  .yody-product-button {
    display: flex;
    justify-content: flex-start;
    .save-button {
      margin-right: 15px;
    }
  }

  .link {
    color: #2a2a86;
    text-decoration: none;
    background-color: transparent;
    outline: none;
    cursor: pointer;
    transition: color 0.3s;
    &:hover {
      color: #1890ff;
      text-decoration: underline;
    }
  }

  .item-price-unit {
    text-decoration: underline;
    text-decoration-color: #737373;
    color: #737373;
  }

  .yody-product-info {
    padding-left: 20px;
  }
`;

export const StyledProductListDropdown = styled.div`
  .item-searched-list {
    display: flex;
    padding: 10px;
    line-height: 16px;

    .item-img {
      margin-right: 5px;
    }

    .item-info {
      width: 90%;
      white-space: break-spaces;

      .name-and-price {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .item-name {
          line-height: 16px;
          width: 200px;
          color: #37394d;
        }

        .item-price-unit {
          text-decoration: underline;
          text-decoration-color: #737373;
          color: #737373;
        }
      }

      .sku-and-stock {
        display: flex;
        justify-content: space-between;
        margin-top: 5px;

        .item-sku {
          width: 200px;
          color: #95a1ac;
        }

        .item-inventory {
          color: #737373;
        }
      }
    }
  }

  .add-new-item-dropdown {
    display: flex;
    min-height: 42px;
    line-height: 50px;
    cursor: pointer;
    .search-icon {
      margin-left: 20px;
    }
    .text {
      margin-left: 20px;
    }
  }
`;
