import styled from "styled-components";

export const StyledComponent = styled.div`
  .text-sort-employee {
    width: 100%;
    text-align: center;
    color: #2a2a86;
  }

  .sort-employee {
    min-height: 400px;
    display: flex;
    align-content: center;

    &-bottom {
      margin-bottom: 15px;
    }
    &-row {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      width: 100%;

      button {
        white-space: initial;
        height: 70px;
        background: #5858b6;
      }
    }
  }
`;
