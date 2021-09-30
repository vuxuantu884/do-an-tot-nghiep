import styled from "styled-components";

export const StyledComponent = styled.div`
  .connected-items {
    padding: 20px;
    
    .filter {
      .ant-form {
        display: flex;
      }
    }

    .filter-item {
      margin-right: 10px;
    }

    .action-dropdown {
      width: 110px;
      margin-right: 10px;
    }

    .select-channel-dropdown {
      margin-right: 10px;
      .ant-col {
        width: 150px;
      }
    }

    .select-store-dropdown {
      margin-right: 10px;
      width: 150px;
    }
    
    .shoppe-search {
      margin-right: 10px;
      width: 230px;
    }
    
    .yody-search {
      margin-right: 10px;
      width: 200px;
    }
  }

  .action-button {
    border: 1px solid $primary-color;
    padding: 6px 15px;
    border-radius: 5px;
    flex-direction: row;
    display: flex;
    align-items: center;
    color: $primary-color;
    &:hover {
      color: $primary-color;
      border: 1px solid $primary-color;
      color: $primary-color;
    }
    &:focus {
      color: $primary-color;
      border: 1px solid $primary-color;
      color: $primary-color;
    }
    &:disabled {
      color: $primary-color;
      border: 1px solid $primary-color;
      color: $primary-color;
      opacity: 0.5;
    }
    &.ant-btn-primary {
      color: white;
    }
  }

`;
