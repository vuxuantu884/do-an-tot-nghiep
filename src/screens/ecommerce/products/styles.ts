import styled from "styled-components";

export const StyledComponent = styled.div`
  .get-products-button {
    background-color: #ffffff;
    border: 1px solid #cccccc;
    &:hover {
        background-color: #AFEEEE;
        border: 1px solid #2a2a86;
    }
  }
`;

export const StyledUpdateProductDataModal = styled.div`
  margin: 20px 0;
  .ecommerce-list-option {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;

    .ant-btn {
      padding: 7px 10px;
      display: flex;
      align-items: center;
      background-color: #ffffff;
      border: 1px solid #e5e5e5;
      img {
        margin-right: 10px;
      }
    }

    .active-button {
      background-color: #f3f3ff;
      color: #222222;
    }

    .icon-active-button {
      margin-left: 5px;
      margin-right: 0 !important;
    }
  }

  .select-shop {
    margin-bottom: 20px;
    .select-shop-body {
      .ant-select {
        width: 100%;
      }
    }
  }

  .item-title {
    font-weight: bolder;
    margin-bottom: 5px;
  }
`;

//common product style
export const StyledProductFilter = styled.div`
  .filter {
    overflow-x: auto;
    .ant-form {
      display: flex;
    }
  }

  .filter-item {
    margin-right: 10px;
  }

  .select-channel-dropdown {
    margin-right: 10px;
    width: 150px;
    min-width: 150px;
  }

  .select-store-dropdown {
    margin-right: 10px;
    min-width: 200px;
  }

  .shoppe-search {
    margin-right: 10px;
    min-width: 230px;
    flex-grow: 1;
  }

  .yody-search {
    margin-right: 10px;
    min-width: 200px;
    flex-grow: 1;
  }

  .render-shop-list {
    .shop-name {
      padding: 5px 10px;
      white-space: nowrap;
      &:hover {
        background-color: #f4f4f7;
      }
      .check-box-name {
        display: flex;
        .name {
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
`;

export const StyledProductLink = styled.div`
  a {
    &:hover {
      text-decoration: underline;
    }
  }
`;
