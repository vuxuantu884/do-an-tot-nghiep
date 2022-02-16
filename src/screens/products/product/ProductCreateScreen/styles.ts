import styled from "styled-components";
import { bluePlus } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  padding-bottom: 40px;
  .extra-cards {
    width: 150px;
    display: flex;
    flex-direction: row;
    align-items: center;
    & > b {
      margin-right: 10px;
    }
    & > label {
      margin-left: 10px;
    }
    &.status {
      width: 250px;
    }
  }
  .a-container {
    display: flex;
    align-items: center;
    justify-content: center;
    .bpa {
      width: 165px;
      height: 165px;
      background: #fafafa;
      border: 1px dashed #d9d9d9;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      row-gap: 10px;
      cursor: pointer;
      .ant-image {
        display: flex;
        width: 100%;
        height: 100%;
        img {
          object-fit: contain;
        }
      }
    }
  }
  .button-plus{
    width: 37px !important; 
    height: 37px !important; 
    padding: 0;
    color: ${bluePlus}
  }
  .care-title {
    font-weight: 500;
    font-size: 1rem;
    margin: 6px 8px 15px 0;
  }
  .care-label {
    font-size: 28px;
    margin: 0px 4px;
    line-height: 32px;
  }
  .button-plus {
    border: 1px solid #E5E5E5;
    background: #FFFFFF;
    color: #757575; 
  }
`;
