import styled from "styled-components";

export const StyledComponent = styled.div`
  .bottomBar {
    position: fixed;
    text-align: right;
    left: ${240 + 20}px;
    padding: 5px 15px;
    bottom: 0%;
    background-color: #fff;
    margin-left: -20px;
    margin-top: 10px;
    right: 0;
    z-index: 99;
    transition: all 0.2s;
    @media screen and (max-width: 1439px) {
      left: ${200 + 20}px;
    }
    &__left {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      height: 100%;
    }
    &__right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
    #btn-order-delete {
      &.ant-dropdown-menu-item-disabled {
        opacity: 0.5;
      }
    }
    button[disabled] {
      opacity: 0.5;
      color: rgb(0 0 0);
    }
  }
  .bottomBarRight {
    &__content {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      height: 100%;
    }
    &__button {
      padding: 0 25px;
      font-weight: normal;
      margin: 0 7px;
      &:first-child {
        margin-left: 0;
      }
      &:last-child {
        margin-right: 0;
      }
    }
  }
`;
