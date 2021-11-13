import styled from "styled-components";

export const StyledComponent = styled.div`
  .bottomBar {
    position: fixed;
    text-align: right;
    left: ${240 + 20}px;
    padding: 5px 10px;
    bottom: 0%;
    background-color: #fff;
    margin-left: -20px;
    margin-top: 10px;
    right: 0;
    z-index: 999;
    transition: all 0.2s;
  }
`;
