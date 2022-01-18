import styled from "styled-components";
import { borderColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .sectionSelectShop {
    align-items: flex-end;
    display: flex;
    margin-bottom: 15px;
    > div {
      &:not(:last-child) {
        margin-right: 5px;
      }
    }
    .ant-form-item {
      margin-bottom: 0;
      width: 370px;
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
      border-bottom: 1px solid ${borderColor};
      border-radius: 3px 3px 0px 0px;
      font-size: 1em;
      font-weight: 500;
      text-transform: uppercase;
    }
    .search {
      margin-bottom: 35px;
    }
    .listShop {
      height: 120px;
      overflow: auto;
    }
    .singleShop {
      align-items: center;
      display: flex;
      font-weight: 500;
      justify-content: space-between;
      padding-right: 10px;
      &:not(:last-child) {
        margin-bottom: 10px;
      }
      &__code {
        color: #2a2a86;
      }
      &__action {
        .single {
          cursor: pointer;
        }
      }
    }
  }
  .inputStoreId {
    width: 170px;
    margin-right: 5px;
  }
  .selectShopId {
    width: 240px;
  }
`;
