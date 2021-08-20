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
      display: flex;
      align-items: flex-end;
    }
    label {
      font-weight: 500;
    }
  }
  .ant-form-item {
    margin-bottom: 0;
  }
  form {
    position: relative;
    padding-bottom: 150px;
  }
  .groupButtons {
    position: fixed;
    bottom: 0;
    left: 240px;
    right: 0px;
    z-index: 9283;
    padding: 20px 20px;
    display: flex;
    justify-content: flex-end;
    background: #fff;
    button {
      &:not(:last-child) {
        margin-right: 10px;
      }
    }
  }
`;
