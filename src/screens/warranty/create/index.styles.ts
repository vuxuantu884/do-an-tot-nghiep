import styled from "styled-components";

export const StyledComponent = styled.div`
  .ant-picker {
    border-radius: 2px;
  }
  .non-select {
    .ant-select {
      .ant-select-selector {
        border-color: #E24343;
      }
    }
  }
  .ant-picker-input {
    input {
      &::placeholder {
      /* Chrome, Firefox, Opera, Safari 10.1+ */
      color: #737373;
      opacity: 1; /* Firefox */
    }
  }
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
    &__right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
  }
`;
