import styled from "styled-components";

export const ModalStyled = styled.div`
  .actions {
    display: flex;
    button {
      &:not(:last-child) {
        margin-right: 20px;
      }
      border-color: #2a2a86;
      background-color: #f3f3ff;
      color: #2a2a86;
    }
  }

  .process {
    width: 100%;
    padding: 0 10% 20px 10%;
    .details {
      display: flex;
      justify-content: space-around;
      .info {
        .value {
          text-align: center;
          font-weight: 700;
        }
      }
    }
  }
  .ant-form {
    p {
      color: #222222;
      font-weight: 500;
      margin-bottom: 5px;
    }
    .date-option {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      .ant-btn {
        width: 30%;
        padding: 0px 5px;
        height: 33.5px;
        line-height: 29px;
      }
    }
    .ant-picker {
      height: 40px;
    }
    .date-range {
      display: flex;
      .swap-right-icon {
        width: 10%;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        .anticon-swap-right {
          font-size: 23px;
          color: #757575;
        }
      }
    }
  }
`;
