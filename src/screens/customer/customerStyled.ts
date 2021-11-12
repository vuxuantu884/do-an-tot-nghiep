import styled from "styled-components";

export const StyledCustomerBaseFilter = styled.div`
  .base-filter-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    .title {
      font-weight: 500;
      color: #222222;
      font-family: Roboto;
      font-style: normal;
      margin-bottom: 6px;
    }

    .left-filter {
      width: 33%;
    }

    .center-filter {
      width: 33%;
    }

    .right-filter {
      width: 30%;
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