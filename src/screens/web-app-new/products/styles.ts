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

  .source-dropdown-filter {
    width: 300px;
    min-width: 200px;
    margin-right: 10px;
    .ant-select-selector {
      padding: 0 10px;
      .ant-select-selection-item {
        display: flex;
        align-items: center;
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
  .action-dropdown .action-button {
    padding: 6px 15px;
    border-radius: 5px;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
}
`;


export const StyledProductLink = styled.div`
  a {
    &:hover {
      text-decoration: underline;
    }
  }
`;

export const StyledBaseFilter = styled.div`
  .select-connection-date {
    padding: 10px;
    border: 1px solid #d9d9d9;
    border-radius: 5px;

    .date-option {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      .ant-btn {
        width: 30%;
        padding: 0 10px;
        border-radius: 3px;
        background-color: #f5f5f5;
      }
      .ant-btn:hover {
        border-color: #2A2A86;
      }
      .active-btn {
        color: #FFFFFF;
        border-color: rgba(42, 42, 134, 0.1);
        background-color: #2A2A86;
      }
    }

  }
  .date-option {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    .ant-btn {
      width: 30%;
      padding: 0px 5px;
      height: 33.5px;
      line-height: 29px;
    }
  }
  .ant-picker {
    height: 40px;
  }
  .date-range {
    display: flex;
    .swap-right-icon {
      width: 10%;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      .anticon-swap-right {
        font-size: 23px;
        color: #757575;
      }
    }
  }
`;
export const StyledComponentSyncStock = styled.div`
  .select-store-dropdown-sync-stock {
    flex-direction: column;
    margin-top: 10px;
    .ant-form-item-label {
      align-self: flex-start;
    }
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
