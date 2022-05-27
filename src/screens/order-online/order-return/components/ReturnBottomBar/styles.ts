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
  .ant-select {
    min-width: 165px;
    &.ant-select-focused {
      .ant-select-selector {
        border-color: #ff0000 !important;
      }
    }
  }
  .bottomBar-detail{
    display: flex;
    align-items: center;
    justify-content: flex-end;
    .btn-detail{
      padding: 0px 25px;
      font-weight: 400;
      margin: 0px 10px;
    }
  }

`;
