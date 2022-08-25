import styled from "styled-components";

export const OrderCartListFilterStyle = styled.div`
  .order-filter {
    overflow-x: auto;
    margin-bottom: 5px;
    .ant-form {
      display: flex;
      .ant-form-item {
        margin-bottom: 5px;
      }
    }
  }

  .default-filter {
    display: flex;
    overflow-x: auto;
    .search-input {
      min-width: 100px;
      flex-grow: 1;
      margin-right: 15px;
    }
  }

  .action-dropdown {
    width: 110px;
    margin-right: 15px;
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

  .filter-tags {
    .tag {
      padding: 10px 10px;
      margin-bottom: 10px;
      background: rgba(42, 42, 134, 0.05);
      border-radius: 50px;
    }
  }

  .ant-tag {
    margin-top: 0;
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

  .threedot-button {
    padding-left: 15px;
  }

  .select-shop-dropdown {
    min-width: 200px;
    margin-right: 15px;
    margin-left: 15px;
  }

  .select-web-app {
    width: 200px;
    min-width: 160px;
    margin-right: 15px;
  }
`;

export const OrderCartListBaseFilterStyle = styled.div`
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

export const AbandonCartBaseFilterStyle = styled.div`
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
