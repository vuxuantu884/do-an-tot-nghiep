import styled from "styled-components";


export const StyledCustomerCard = styled.div`
  .page-header {
    height: 80px;
  }

  .customer-card {
    .ant-card-body {
      padding-top: 0;
    }
  }

  .loyalty-cards-release {
    margin-top: 20px;
  }

  .loyalty-cards-list {
    margin-top: 20px;
    .card {
      font-size: 14px;
      line-height: 16px;
      margin: auto;
      width: 120px;
      height: 26px;
      color: white;
      justify-content: center;
      display: flex;
      border-radius: 100px;
      align-items: center;
      &__ACTIVE {
          background-color: #27AE60;
      }
      &__ASSIGNED {
          background-color: #2A2A86;
      }
      &__LOCKED {
          background-color: #676767;
      }
      &__INACTIVE {
          background-color: #676767;
      }
    }
  }

`;
