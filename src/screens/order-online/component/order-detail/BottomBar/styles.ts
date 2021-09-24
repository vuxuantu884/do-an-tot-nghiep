import styled from "styled-components";

export const StyledComponent = styled.div`
  position: fixed;
  text-align: right;
  width: 100%;
  padding: 5px 0;
  bottom: 0%;
  background-color: #fff;
  margin-left: -25px;
  margin-top: 10px;
  z-index: 99;
  .ant {
    //Steps
    &-steps {
      &-small {
        .ant-steps-item-title,
        .ant-steps-item-description {
          font-size: 12px;
        }
      }
      &-item {
        &-icon {
          width: 24px !important;
          height: 24px !important;
          margin-left: 57px !important;
        }
        &-description {
          color: $placeholder-color !important;
        }
        &-wait {
          .ant-steps-item-tail {
            top: 11px !important;
            &::after {
              background-color: #d9d9e4 !important;
              margin-left: 10px !important;
            }
          }
          .ant-steps-icon-dot {
            background-color: #d9d9e4 !important;
          }
        }
        &-process {
          .ant-steps-item-tail {
            top: 11px !important;
            background-color: #2a2a86;
            &::after {
              background-color: #2a2a86;
              margin-left: 10px !important;
            }
          }
          .ant-steps-icon-dot {
            background-color: #2a2a86 !important;
          }
          .ant-steps-item-title,
          .ant-steps-item-description {
            font-weight: 500;
            color: #2a2a86;
            font-family: Roboto;
          }
          .ant-steps-item-icon > .ant-steps-icon .ant-steps-icon-dot {
            background-color: #2a2a86;
          }
        }
        &-finish {
          .ant-steps-item-tail {
            top: 11px !important;
            &::after {
              background-color: #2a2a86 !important;
              margin-left: 10px !important;
            }
          }
          .ant-steps-icon-dot {
            color: $white;
            background-color: #2a2a86 !important;
          }
        }
      }
      &-icon {
        &-dot {
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
    }
  }
  .cancelled {
    .ant-steps-item-tail {
      background-color: #e24343 !important;
      &::after {
        background-color: #e24343 !important;
      }
    }
    .ant-steps-icon-dot {
      background-color: #e24343 !important;
    }
  }
  .inactive {
     
    .ant-steps-item-tail {
      background-color: #d9d9e4 !important;
      &::after {
        background-color: #d9d9e4 !important;
      }
    }
    .ant-steps-icon-dot {
      color: #d9d9e4 !important;
      background-color: #d9d9e4 !important;
    }
  }
  
`;
