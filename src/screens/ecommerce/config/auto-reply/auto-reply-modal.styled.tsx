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
`;
