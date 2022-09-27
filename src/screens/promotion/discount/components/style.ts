import styled from "styled-components";

export const DiscountFilterStyled = styled.div`
  .discount-filter {
    .page-filter {
      padding: 0;
      &-right {
        margin-left: 16px;
        width: 100%;
        .ant-space {
          width: 100%;
          &-item {
            width: 100%;
            .ant-form-inline {
              display: flex;
              flex-wrap: nowrap;
              width: 100%;
              .search {
                flex-grow: 1;
              }
              .search-variant {
                min-width: 200px;
                width: 25%;
              }
              .select-state {
                min-width: 150px;
                width: 20%;
              }
            }
          }
        }
      }
    }
    .ant-form-item:last-child {
      margin: 0 0px;
    }
  }

  .order-filter-tags .ant-tag.tag {
    padding: 10px 10px;
    margin-bottom: 20px;
    background: rgba(42, 42, 134, 0.05);
    border-radius: 50px;
  }

  .filter-tags {
    margin-top: 20px;
    .ant-tag {
      margin-top: 0;
      margin-bottom: 8px;
    }
    .tag {
      padding: 10px 20px;
      background: rgba(42, 42, 134, 0.05);
      border-radius: 50px;
      white-space: normal;
    }
  }
`;
