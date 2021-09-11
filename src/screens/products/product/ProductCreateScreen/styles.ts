import styled from "styled-components";

export const StyledComponent = styled.div`
  padding-bottom: 40px;
  .card {
    margin-top: 20px;
  }
  .extra-cards {
    width: 150px;
    display: flex;
    flex-direction: row;
    align-items: center;
    &>b {
      margin-right: 10px;
    }
    &>label {
      margin-left: 10px;
    }
    &.status {
      width: 250px;
    }
  }
`;
