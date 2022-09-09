import styled from "styled-components";
export const StyleComponent = styled.div`
  .ant-form-item-label > label {
    position: relative;
    display: inline-flex;
    align-items: center;
    height: 40px;
  }

  .ant-form > .btn-import {
    margin: 0px;
  }
  .error {
    margin-top: 24px;
    padding: 24px;
    background: #f1f1f1;
    max-height: 500px;
    overflow: auto;
    position: relative;
  }

  .remove-error {
    position: absolute;
    top: 5px;
    right: 5px;
    color: #737373;
    font-size: 10px;
    cursor: pointer;
  }

  @media only screen and (max-width: 1366px) {
    .error {
      max-height: 180px;
    }
  }
`;
