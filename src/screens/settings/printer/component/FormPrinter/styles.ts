import styled from "styled-components";

export const StyledComponent = styled.div`
  .sectionFilter .ant-col {
    display: flex;
    align-items: flex-end;
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
        margin-right: 5px;
      }
    }
  }
`;
