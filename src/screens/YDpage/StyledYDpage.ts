import styled from "styled-components";

export const StyledYDpage = styled.div`
  height: 100%;
  .page-header {
    height: auto;
  }
  .ydpage-body {
    height: 90%;
    background-color: white;
    display: flex;
    .left-body {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 40%;
      background-color: #fff7e7;
      .title {
        margin-bottom: 40px;
        .label {
          font-weight: bold;
          font-size: 36px;
          line-height: 59px;
          color: #2a2a86;
          text-transform: uppercase;
        }
        .description {
          font-size: 24px;
          color: #2a2a86;
        }
      }
      .image {
        margin: 0 auto;
      }
    }
    .right-body {
      flex-grow: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      .row-button {
        display: flex;
        margin-bottom: 40px;
        justify-content: flex-start;
      }
      .social-button {
        display: flex;
        padding: 10px;
        align-items: center;
        width: 200px;
        height: 60px;
        box-shadow: 0px 4px 10px 0px #0000001a;
        border-radius: 8px;
        &:hover {
          cursor: pointer;
          transition: 0.5s;
          box-shadow: 0px 4px 10px 0px gray;
        }
        .text-button {
          font-size: 18px;
          line-height: 21px;
          color: #222222;
        }
      }
      .facebook {
        margin-right: 60px;
      }
    }
  }
  .ydpage-iframe {
    border: none;
    margin-left: -20px;
    width: calc(100% + 40px) !important;
    height: calc(100% + 55px) !important;
  }
`;
