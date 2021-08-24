import styled from "styled-components";

export const StyledComponent = styled.div`
  .cardHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    &__left {
      display: flex;
      align-items: center;
    }
    .name {
      margin-bottom: 0;
    }
    .link {
      font-weight: normal;
    }
  }
`;
