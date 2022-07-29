import styled from "styled-components";

export const StyledComponent = styled.div`
  .history-filter {
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
                flex: 4;
              }
              .date {
                flex: 1;
              }
            }
          }
        }
      }
    }
  }
`;
