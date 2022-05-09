import styled from "styled-components";

export const StyledPointAdjustment = styled.div`
  .page-header {
    height: auto;
  }
  
  .ant-form-item {
    margin-bottom: 20px;
  }

  .filter {
    margin-bottom: 5px;
    .ant-form {
      .ant-form-item {
        margin-bottom: 5px;
      }
    }

    .check-validate-adjustment {
      width: 15%;
      margin-right: 10px;
    }
  
    .form-adjustment-arrow-icon {
      height: 38px;
      line-height: 38px;
      transform: translateY(-2px);
    }
  }

  .search-input {
    margin-right: 10px;
    min-width: 50px;
    flex-grow: 1;
    width:10%
  }

  .select-reason {
    margin-right: 10px;
    min-width: 20%;
    width: 20%;
  }

  .regulator {
    margin-right: 10px;
    min-width: 150px;
    min-width: 20%;
    width: 20%;
  }
  .datetime {
    margin-right: 10px;
    min-width: 13%;
    width: 13%;
    
  }

  .select-scope {
    display: flex;
    flex-grow: 1;
    min-width: 180px;
    align-items: baseline;
    .select-item {
      width: 40%;
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
      &-label {
        font-weight: 500;
        margin-bottom: 8px;
      }
      
      &-content {
        &-info-customer {
          display: flex;
          justify-content: space-between;
        }
      }

      .search-info-customer {
        flex-grow: 1;
        margin-right: 20px;
      }
			
			.customer-adjustment-file-name {
				display: flex;
				align-items: center;
				padding-left: 20px;
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
