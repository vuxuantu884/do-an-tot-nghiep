import styled from "styled-components";

export const InventoryFiltersWrapper = styled.div`
  .ant-form-inline .ant-form-item {
    margin-right: 0px;
  }

  .page-filter-left {
    width: 110px;

    button {
      justify-content: space-between;
      width: 100%;
    }
  }

  .page-filter {
    &-right {
      width: 100%;
      .ant-space {
        width: 100%;
        &-item {
          width: 100%;
          .ant-form {
            display: flex;
            width: 100%;
            &-item {
              margin-left: 16px;  
            }
            .search {
              flex: 3;
            }
            .store {
              flex: 1
            }
          }
        }
      }
    }

    .select-item {
      width: 200px;
    }
  }
`;
