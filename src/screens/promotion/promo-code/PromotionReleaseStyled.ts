import styled from "styled-components";

export const PromotionReleaseFilterStyled = styled.div`
  .promotion-release-filter {
    .ant-form-item:last-child {
      margin: 0;
    }
    .page-filter {
      padding: 0;
    }
    .page-filter-right {
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
              flex-grow: 1;
              min-width: 150px;
            }
            .select-state {
              min-width: 250px;
              width: 20%;
            }
          }
        }
      }
    }
    
    .filter-tags {
      margin: 20px 0;
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
  }
`;
