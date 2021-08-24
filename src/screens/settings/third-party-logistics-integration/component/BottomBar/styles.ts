import styled from "styled-components";

export const StyledComponent = styled.div`
  .bottomBar {
    position: fixed;
    bottom: 0;
    left: 240px;
    right: 0px;
    z-index: 983;
    padding: 20px 20px;
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    &__right {
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }
    button {
      &:not(:last-child) {
        margin-right: 10px;
      }
    }
  }
`;
