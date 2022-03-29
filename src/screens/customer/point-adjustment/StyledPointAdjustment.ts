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
      .ant-select-selection-overflow {
        flex-wrap: nowrap;
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
      margin-bottom: 10px;
      background: rgba(42, 42, 134, 0.05);
      border-radius: 50px;
      white-space: normal;
    }
  }

  .custom-table .ant-table.ant-table-middle .ant-table-thead > tr > th {
    text-align: center;
  }

`;

export const StyledPointAdjustmentDetail = styled.div`
  .page-header {
    height: auto;
  }
`;

export const StyledCreatePointAdjustment= styled.div`
  .create-point-adjustments {
    .ant-form-item {
      margin: 0 0 20px;
    }
    .row {
      margin-bottom: 4px;
      &-label {
        font-weight: 500;
        margin-bottom: 8px;
      }
    }
    .footer-controller {
      margin-left: -50px;
      margin-right: -12px;
      position: fixed;
      text-align: right;
      height: 55px;
      bottom: 0%;
      background-color: rgb(255, 255, 255);
      z-index: 2;
      width: 100%;
      padding-right: 250px;
      row-gap: 0px;
      box-shadow: 5px 5px 10px 10px #0000001a;
      .back {
        display: flex;
        align-items: center;
        padding-left: 24px !important;
        cursor: pointer;
        .back-wrapper {
          display: flex;
          align-items: center;
        }
        a {
          color: #737373;
        }
        svg {
          margin-right: 8px;
        }
      }
      .action-group {
        padding-right: 30px !important;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        .save-btn {
          margin-left: 30px;
        }
        .cancel-btn {
          background-color: white;
          &:hover {
            color: #222222;
            background-color: white;
          }
        }
      }
    }
  }
`;
