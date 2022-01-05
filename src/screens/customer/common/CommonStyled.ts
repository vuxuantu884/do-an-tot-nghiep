import styled from "styled-components";


export const StyledFooterAction = styled.div`
  .footer-action {
    display: flex;
    justify-content: space-between;
    height: 55px;
    width: 100%;
    padding-left: 20px;
    margin-left: -20px;
    box-shadow: -5px -5px 10px lightgrey;
    align-items: center;
    position: fixed;
    bottom: 0px;
    background-color: white;
    z-index: 99;

    .go-back-button {
      border: none;
      padding: 0;
      color: #737373;
      :hover {
        text-decoration: none;
        background-color: white;
      }
    }
    .confirm-button {
      position: fixed;
      right: 20px;
    }
  }
`;
