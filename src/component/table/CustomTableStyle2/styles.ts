import styled from "styled-components";

export const StyledComponent = styled.div`
  .pagination {
    color: #000;
    margin-top: 25px;
    .ant-row {
      display: flex;
      align-items: center;
    }
    &__main {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .ant-select {
      &:hover,
      &.ant-select-open {
        .ant-select-selector {
          background: #2a2a86 !important;
          color: #fff;
        }
        .ant-select-selection-item {
          color: inherit;
        }
        .ant-select-arrow {
          color: #fff;
        }
      }
      .ant-select-selector {
        background: #e5e5e5;
        border-radius: 23.5px;
        border: none;
        transition: 0.3s ease;
        padding: 0 20px;
      }
      .ant-select-selection-item {
        transition: none;
      }
    }
    &__main {
      .ant-pagination-item {
        background: #f5f5f5;
        border-radius: 2px;
        color: #222;
        min-width: 35px;
        line-height: 35px;
        height: 35px;
        &:not(.ant-pagination-disabled) {
          &:hover,
          &.ant-pagination-item-active {
            background: #2a2a86;
            color: #fff;
            a {
              color: #fff !important;
            }
          }
        }
      }
      .ant-pagination-jump-next,
      .ant-pagination-jump-prev,
      .ant-pagination-next,
      .ant-pagination-prev {
        min-width: 35px;
        line-height: 35px;
        height: 35px;
        .ant-pagination-item-link {
          border-radius: 2px;
        }
        &:not(.ant-pagination-disabled) {
          &:hover {
            .ant-pagination-item-link {
              background: #2a2a86;
              color: #fff;
            }
          }
        }
      }

      .ant-pagination-first,
      .ant-pagination-last {
        .ant-pagination-item-link {
          padding: 0 10px;
        }
      }
    }
    &__sizeChange {
      > label {
        color: inherit;
      }
    }
  }
`;
