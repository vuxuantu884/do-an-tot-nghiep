import styled from "styled-components";

export const StyledComponent = styled.div`
  .bottomBar {
    align-items: center;
    background: #fff;
    bottom: 0;
    display: flex;
    justify-content: space-between;
    left: 240px;
    padding: 10px 20px;
    position: fixed;
    right: 0px;
    z-index: 983;
    &__right {
      align-items: center;
      display: flex;
      justify-content: flex-end;
      > * {
        &:not(:last-child) {
          margin-right: 10px;
        }
      }
    }
  }
  .back {
    color: #737373;
    font-weight: 500;
  }
`;
