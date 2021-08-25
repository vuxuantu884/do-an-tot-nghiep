import styled from "styled-components";

export const StyledComponent = styled.div`
  .sectionFilter {
    .ant-form-item {
      width: 100%;
    }
    .ant-form-item-control-input {
      width: 100%;
    }
    .ant-col {
      align-items: flex-end;
      display: flex;
    }
    label {
      font-weight: 500;
    }
  }
  .ant-form-item {
    margin-bottom: 0;
  }
  form {
    padding-bottom: 150px;
    position: relative;
  }
  .groupButtons {
    background: #fff;
    bottom: 0;
    display: flex;
    justify-content: flex-end;
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
  }
`;
