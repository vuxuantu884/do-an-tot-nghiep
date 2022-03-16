import styled from "styled-components";


export const AllOrdersMappingStyled = styled.div`
  
`;

export const AllOrdersMappingFilterStyled = styled.div`
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

  .select-shop-dropdown {
    min-width: 200px;
    margin-right: 15px;
    margin-left: 15px;
  }

  .ecommerce-dropdown {
    width: 160px;
    min-width: 140px;
    margin-right: 10px;
    .ant-select-selector {
      padding: 0 10px;
      .ant-select-selection-item {
        display: flex;
        align-items: center;
      }
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
`;
