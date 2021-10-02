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
      margin-right: 10px;
    }

    .select-channel-dropdown {
      margin-right: 10px;
      width: 180px;
    }

    .select-store-dropdown {
      margin-right: 10px;
      width: 200px;
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

  .render-shop-list {
    .shop-name {
      padding: 5px 10px;
      white-space: nowrap;
      &:hover{
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
