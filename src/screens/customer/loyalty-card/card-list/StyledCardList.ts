import styled from "styled-components";

export const StyledCardList = styled.div`
  .basic-filter {
    display: flex;
    overflow-x: auto;
    .search-input {
      min-width: 250px;
      flex-grow: 1;
    }

    div:not(:last-child) {
      margin-right: 15px;
    }
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
