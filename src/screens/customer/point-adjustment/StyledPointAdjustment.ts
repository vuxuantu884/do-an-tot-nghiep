import styled from "styled-components";

export const StyledPointAdjustment = styled.div`
  .page-header {
    height: auto;
  }
  
  .ant-form-item {
    margin-bottom: 20px;
  }

  .basic-filter {
    display: flex;
    overflow-x: auto;

    .search-input {
      min-width: 250px;
      flex-grow: 1;
    }

    .select-reason {
      width: 320px;
      min-width: 350px;
      .ant-select-selector {
        width: 100%;
      }
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
      padding: 10px 10px;
      margin-bottom: 20px;
      background: rgba(42, 42, 134, 0.05);
      border-radius: 50px;
    }
  }

  .custom-table .ant-table.ant-table-middle .ant-table-thead > tr > th {
    text-align: center;
  }

`;
