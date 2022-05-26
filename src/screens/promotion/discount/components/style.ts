import styled from "styled-components";

export const StyledComponent = styled.div`
  .discount-filter {
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
    .ant-form-item:last-child {
            margin: 0 0px;
          }

    .search-variant {
			min-width: 200px;
			width: 25%;
		}
  }

  .order-filter-tags .ant-tag.tag {
    padding: 10px 10px;
    margin-bottom: 20px;
    background: rgba(42, 42, 134, 0.05);
    border-radius: 50px;
  }

  .filter-tags {
    .ant-tag {
      margin-top: 0;
    }
    .tag {
      padding: 10px 20px;
      margin-bottom: 10px;
      background: rgba(42, 42, 134, 0.05);
      border-radius: 50px;
      white-space: normal;
    }
  }
  
`;