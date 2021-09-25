import styled from "styled-components";

export const PWFormFilter = styled.div`
  .date-option {
    display: flex;
    justify-content: space-evenly;
    margin-bottom: 10px;

    & button {
      width: 30%;
    }
  }

  .ant-row {
    &.create-date {
      margin-top: 10px;
      margin-bottom: 20px;
    }
  }

  button.active {
    color: #ffffff;
    border-color: rgba(42, 42, 134, 0.1);
    background-color: #2a2a86;
  }

  button.deactive {
    color: #2a2a86;
    border-color: rgba(42, 42, 134, 0.05);
    background-color: rgba(42, 42, 134, 0.05);
  }
`;

export const ProductWrapperStyled = styled.div`
  .product-filter {
    .page-filter {
      &-right {
        margin-left: 16px;
        width: 100%;
        .ant-space {
          width: 100%;
          &-item {
            width: 100%;
            .ant-form {
              display: flex;
              width: 100%;
              .search {
                flex: 1;
              }
            }
          }
        }
      }
    }
  }

  .order-filter-tags .ant-tag.tag {
    padding: 10px 10px;
    margin-bottom: 20px;
    background: rgba(42, 42, 134, 0.05);
    border-radius: 50px;
  }
`;
