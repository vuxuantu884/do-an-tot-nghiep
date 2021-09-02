import styled from "styled-components";

export const StyledComponent = styled.div`
  .ant-card {
    margin-bottom: 20px;
    .ant-card-body {
      padding: 20px 20px;
    }
    .ant-card-head-title {
      font-weight: 500;
      text-transform: uppercase;
      font-size: 14px;
    }
  }
  label {
    font-weight: 500;
  }
  .groupButtons {
    background: #fff;
    bottom: 0;
    display: flex;
    justify-content: space-between;
    left: 240px;
    padding: 20px 20px;
    position: fixed;
    right: 0px;
    z-index: 983;
    button {
      &:not(:last-child) {
        margin-right: 10px;
      }
    }
    &__left {
    }
    &__right {
      display: flex;
      justify-content: flex-end;
    }
  }
`;
