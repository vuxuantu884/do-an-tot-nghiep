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

}
`;
