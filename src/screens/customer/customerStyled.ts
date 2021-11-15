import styled from "styled-components";

export const StyledCustomerFilter = styled.div`
  .inline-filter {
    width: 100%;
    display: flex;
    margin-bottom: 20px;
    .input-search {
      flex-grow: 1;
    }
  }

`;

export const StyledCustomerBaseFilter = styled.div`
  .base-filter-container {
    margin-top: 10px;
    .base-filter-row {
      display: flex;
      flex-direction: row;
      justify-content: space-between;

      .left-filter {
        width: 33%;
      }
  
      .center-filter {
        width: 33%;
      }
  
      .right-filter {
        width: 30%;
      }
    }  

    .title {
      font-weight: 500;
      color: #222222;
      font-family: Roboto;
      font-style: normal;
      margin-bottom: 6px;
    }

    .select-scope {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      .select-item {
        width: 40%;
      }
    }

    .select-connection-date .date-option .ant-btn {
      width: 32%;
      padding: 0 6px;
    }

  }
  
`;

export const StyledCustomerExtraButton = styled.div`
  .import-file-button {
    margin-right: 15px;
  }

  .export-file-button {
    margin-right: 15px;
  }
  
`;
