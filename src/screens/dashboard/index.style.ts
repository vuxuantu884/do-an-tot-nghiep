import styled from "styled-components";
export const ChartColor = {
  primary: "#2A2A86",
  secondary: "#FCAF17",
  cinnabar: "#E24343",
  black: "black",
  white: "white",
};
export const StyledComponent = styled.div`
  .dash-board-options {
    border-bottom: 1px solid #5252;
    .ant-radio-group {
      .ant-radio-button-wrapper {
        border-style: none;
        border-width: 0;
        box-shadow: none;
        height: auto;
        padding: 5px 0;
        margin: 0 0 0 32px;
        background-color: #f3f3f7;
        font-size: 15px;
        font-weight: 500;
        &:first-child {
          margin-left: 0;
        }
      }
      .ant-radio-button-wrapper:first-child {
        border-left: none;
        border-radius: none;
      }
      .ant-radio-button-wrapper:not(:first-child):before {
        width: 0;
      }
      .ant-radio-button-wrapper-checked {
        color: #2a2a86;
        border-bottom: 2px solid #2a2a86;
      }
    }
  }
`;
