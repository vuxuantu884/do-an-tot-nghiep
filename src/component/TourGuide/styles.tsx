import styled from "styled-components";

export const TourGuideStyled = styled.div`
  .wrapper {
    background-color: rgb(255, 255, 255);
    border-radius: 5px;
    box-sizing: border-box;
    color: rgb(51, 51, 51);
    font-size: 16px;
    max-width: 100%;
    padding: 15px;
    position: relative;
    width: 300px;
    
    .wrapper-icon {
      text-align: right;
      line-height: 32px;
      margin-bottom: 10px;
      .close-icon {
        cursor: pointer;
        color: gray;
      }
    }
    
    .content {
      padding: 0 0 30px 0;
    }
    
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  .hidden {
    visibility: hidden;
  }
`