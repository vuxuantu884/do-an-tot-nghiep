import styled from "styled-components";

export const StyledComponent = styled.div`
  @media screen and (max-width: 600px) {
    .ant-col-12 {
      flex: 0 0 100%;
      max-width: 100%;
    }
  }
  .footer {
    display: flex;
    &__create {
      justify-content: flex-end;
    }
    &__edit {
      justify-content: space-between;
    }
  }
`;
