import styled from "styled-components";

export const StyledComponent = styled.div`
  .total-items-ecommerce {
    padding: 20px;
    
    .filter {
      .ant-form {
        display: flex;
      }
    }

    .filter-item {
      margin-right: 15px;
    }

    .select-channel-dropdown {
      margin-right: 15px;
      width: 150px;
    }

    .select-store-dropdown {
      margin-right: 15px;
      width: 150px;
    }
    
    .shoppe-search {
      margin-right: 15px;
      width: 230px;
    }
    
    .yody-search {
      margin-right: 15px;
      width: 200px;
    }

    .save-pairing-button {
      margin: 20px 0;
    }
  }

  .delete-item-icon {
    cursor: pointer;
    width: 26px;
    &:hover {
      border: 1px solid #5c5c5c;
    }
  }
`;

export const StyledYodyProductColumn = styled.div`
  .button {
    display: flex;
    justify-content: space-evenly;
  }
`;
