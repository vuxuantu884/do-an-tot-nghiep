import styled from "styled-components";

export const StyledComponent = styled.div`
  .buttonNotifyWrapper {
    vertical-align: middle;
  }
  .button-notify {
    border: none;
    padding: 0;
    display: flex;
    width: auto;
    height: auto;
    font-size: 20px;
    line-height: normal;
    align-items: center;
    background-color: transparent;
    &:focus,
    &:active {
      background-color: transparent;
      border: none;
    }
  }
  .logo-header img {
    width: 80px;
    height: auto;
  }
`;
