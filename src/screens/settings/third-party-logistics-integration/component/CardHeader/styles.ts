import styled from "styled-components";

export const StyledComponent = styled.div`
  .cardHeader {
    align-items: center;
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    &__left {
      align-items: center;
      display: flex;
    }
    .name {
      margin-bottom: 0;
    }
    .link {
      font-weight: normal;
    }
    &__right {
      text-transform: none;
    }
  }
  .logoSingleThirdPartyLogistic {
    margin-right: 10px;
  }
`;
