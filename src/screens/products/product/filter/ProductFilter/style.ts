import styled from "styled-components";

export const StyledComponent = styled.div`
  .product-filter {
    .page-filter {
      width: 100%;
      .ant-form-item {
        flex: auto;
      }
      .ant-form-item:last-child {
        margin-right: 0;
      }
      .page-filter-left {
        margin-right: 20px;
      }
      .page-filter-right {
        display: flex;
        width: 100%;
        justify-content: space-between;
        .ant-space {
          width: 100%;
          gap: 0 !important;
          &-item{
            margin-right: 20px;
          }
          &-item:first-child{
            width: 100%;
          }
          &-item:last-child{
            margin-right: 0 !important;
          }
          
        }
      }
      .search {
        width: 100%;
        min-width: 250px;
      }
    }
  }

  .order-filter-tags .ant-tag.tag {
    padding: 10px 10px;
    margin-bottom: 20px;
    background: rgba(42, 42, 134, 0.05);
    border-radius: 50px;
  }
  
  .w-100 {
    width: 100%;
  }
`;
