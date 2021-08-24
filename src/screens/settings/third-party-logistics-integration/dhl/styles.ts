import styled from "styled-components";

export const StyledComponent = styled.div`
  .sectionSelectShop {
    display: flex;
    align-items: flex-end;
    margin-bottom: 15px;
    > div {
      &:not(:last-child) {
        margin-right: 5px;
      }
    }
    .ant-form-item {
      width: 370px;
      margin-bottom: 0;
    }
    button {
      &:not(:last-child) {
        margin-right: 5px;
      }
    }
  }
  .ant-card-body {
    padding: 20px 20px;
  }
  .cardShopIsSelected {
    .ant-card-head {
      background: #f5f5f5;
      border-bottom: 1px solid #e5e5e5;
      border-radius: 3px 3px 0px 0px;
      font-size: 1em;
      text-transform: uppercase;
      font-weight: 500;
    }
    .search {
      margin-bottom: 35px;
    }
    .listShop {
      height: 120px;
      overflow: auto;
    }
    .singleShop {
      padding-right: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 500;
      &:not(:last-child) {
        margin-bottom: 10px;
      }
      &__code {
        color: #2a2a86;
      }
    }
  }
`;
