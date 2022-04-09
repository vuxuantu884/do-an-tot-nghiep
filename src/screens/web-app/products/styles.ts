import styled from "styled-components";
import { borderColor } from "utils/global-styles/variables";

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
  .ecommerce-list-option {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;

    .ant-btn {
      padding: 7px 10px;
      display: flex;
      align-items: center;
      background-color: #ffffff;
      border: 1px solid ${borderColor};
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
    margin-bottom: 5px;
    .ant-form {
      display: flex;
      .ant-form-item {
        margin-bottom: 5px;
      }
    }
  }

  .select-channel-dropdown {
    margin-right: 10px;
    min-width: 150px;
  }

  .select-store-dropdown {
    margin-right: 10px;
    min-width: 180px;
    width: 300px;
  }

  .search-ecommerce-product {
    margin-right: 10px;
    min-width: 180px;
    flex-grow: 1;
  }

  .search-yody-product {
    margin-right: 10px;
    min-width: 180px;
    flex-grow: 1;
  }

  // style for not connected items tab
  .not-connected-items-filter {
    .action-dropdown {
      margin-right: 15px;
    }
    .select-channel-dropdown {
      margin-right: 15px;
      min-width: 150px;
      width: 200px;
    }
    .select-store-dropdown {
      margin-right: 15px;
      width: 38%;
    }
    .search-ecommerce-product {
      margin-right: 15px;
    }
  }

  .render-shop-list {
    max-height: 160px;
    overflow-x: hidden;
    overflow-y: scroll;
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
  .order-filter-tags .tag {
    margin-bottom: 5px;
    margin-top: 5px;
    padding: 5px 10px;
    border-radius: 50px;
  }
`;


export const StyledProductLink = styled.div`
  a {
    &:hover {
      text-decoration: underline;
    }
  }
`;
