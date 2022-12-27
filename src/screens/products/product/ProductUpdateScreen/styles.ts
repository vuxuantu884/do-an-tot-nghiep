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
            display: flex;
            &-tax {
              margin-right: 15px;
              &-title {
                margin-right: 10px;
              }
            }
          }
        }
        .container-view {
          padding: 20px;
          .variant-image {
            display: flex;
            align-items: center;
            &-label {
              width: 150px;
              color: #000000;
              font-weight: 500;
              margin-right: 10px;
            }
            .upload-btn {
              color: #2a2a86;
            }
          }
        }
        .divider-row {
          margin-top: 0px;
          margin-bottom: 20px;
        }
        .tax-alert {
          margin-bottom: 20px;
          &-title {
            color: #666666;
          }
          &-content {
            margin-left: 3px;
            color: #222222;
            font-weight: 500;
          }
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
      .text-success {
        color: #2a2a86;
      }
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
    border: 1px solid #e5e5e5;
    background: #ffffff;
    color: #757575;
    .anticon {
      vertical-align: 0.125em;
    }
    width: 28px;
    height: 28px;
  }
`;
