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
`;
