import styled from "styled-components";
import { borderColor } from "utils/global-styles/variables";

export const OrderSyncStyle = styled.div`
  .page-header {
    height: auto;
    padding: 20px 0;
  }

  .ant-tabs-nav {
    padding: 0;
    .ant-tabs-tab {
      padding: 20px;
    }
  }
`;
export const StyledDownloadOrderData = styled.div`
  .ecommerce-list {
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
`;
export const OrderSyncFilterStyle = styled.div`
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
export const OrderSyncBaseFilterStyle = styled.div`
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
export const StyledStatus = styled.div`
  .green-status {
    background: #f0fcf5;
    color: #27ae60;
    border-radius: 100px;
    padding: 5px 15px;
    margin: 0 auto;
  }

  .red-status {
    background: rgba(226, 67, 67, 0.1);
    color: #e24343;
    border-radius: 100px;
    padding: 5px 15px;
    margin: 0 auto;
  }

  .yellow-status {
    background: #fffaf0;
    color: #fcaf17;
    border-radius: 100px;
    padding: 5px 15px;
    margin: 0 auto;
  }

  .blue-status {
    background: rgba(42, 42, 134, 0.1);
    color: #2a2a86;
    border-radius: 100px;
    padding: 5px 15px;
    margin: 0 auto;
  }

  .gray-status {
    background: rgba(102, 102, 102, 0.1);
    color: #666666;
    border-radius: 100px;
    padding: 5px 15px;
    margin: 0 auto;
  }
`;
export const StyledProgressDownloadModal = styled.div`
  .progress-body {
    width: 80%;
    margin: 0 auto;
    .progress-count {
      display: flex;
      justify-content: space-between;
      text-align: center;
      .total-count {
        font-weight: 700;
        color: #222222;
      }
      .total-created {
        font-weight: 700;
        color: #fcaf17;
      }
      .total-updated {
        font-weight: 700;
        color: #27ae60;
      }
      .total-error {
        font-weight: 700;
        color: #e24343;
      }
    }
  }

  .error-orders {
    .title {
      margin: 20px 0;
      font-weight: bold;
    }
    .error_message {
      max-height: 300px;
      overflow-y: scroll;
    }
  }
`;
