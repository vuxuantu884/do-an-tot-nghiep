import styled from "styled-components";
import { borderColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  padding-bottom: 40px;
  .card {
    .card-container {
      .left {
        border-right: 1px solid ${borderColor};
      }
      .right {
        .header-view {
          padding: 16px 20px;
          border-bottom: 1px solid ${borderColor};
          justify-content: space-between;
          display: flex;
          flex-direction: row;
          &-left {
          }
          &-right {
          }
        }
        .container-view {
          padding: 20px;
        }
      }
    }
  }
  .extra-cards {
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
  .label-switch {
    margin-left: 10px;
  }
  .a-container {
    display: flex;
    align-items: center;
    justify-content: center;
    .bpa {
      background: #fafafa;
      border: 1px dashed #d9d9d9;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      row-gap: 10px;
      cursor: pointer;
      height: 165px;
      width: 165px;
      img {
        height: 165px;
        width: 165px;
        object-fit: contain;
      }
    }
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
    .anticon {
      vertical-align: 0.125em;
    }
    width: 28px;
    height: 28px;
  }
`;
