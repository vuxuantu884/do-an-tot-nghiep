import styled from "styled-components";

export const StyledWrapper = styled.div`
  .ant-steps-dot .ant-steps-item-content,
  .ant-steps-dot.ant-steps-small .ant-steps-item-content {
    width: 84px;
  }
  .ant-steps-label-vertical .ant-steps-item {
    width: 84px;
    flex: initial;
  }
  .ant-steps-dot .ant-steps-item-tail:after,
  .ant-steps-dot.ant-steps-small .ant-steps-item-tail:after {
    width: 100%;
  }
  .ant-steps-small .ant-steps-item-description {
    font-size: 10px;
  }
  .inventory-transfer-step {
    .ant {
      //Steps
      &-steps {
        &-small {
          .ant-steps-item-title {
            font-size: 12px;
          }

          .ant-steps-item-description {
            font-size: 10px;
          }
        }
        &-item {
          &-tail {
            margin-left: 42px !important;
          }
          &-icon {
            width: 14px !important;
            height: 14px !important;
            margin-left: 35px !important;
          }
          &-description {
            color: $placeholder-color !important;
          }
          &-wait {
            .ant-steps-item-tail {
              top: 6px !important;
              margin: 0 0 0 35px;
              &::after {
                background-color: #d9d9e4 !important;
                margin-left: 0px !important;
              }
            }
            .ant-steps-icon-dot {
              background-color: #d9d9e4 !important;
            }
          }
          &-process {
            .ant-steps-item-tail {
              top: 6px !important;
              background-color: #2a2a86;
              margin: 0 0 0 45px;
              &::after {
                background-color: #2a2a86;
                margin-left: 0px !important;
              }
            }
            .ant-steps-icon-dot {
              background-color: #2a2a86 !important;
            }
            .ant-steps-item-title,
            .ant-steps-item-description {
              font-weight: normal;
              color: #2a2a86;
              font-family: Roboto;
            }
            .ant-steps-item-icon > .ant-steps-icon .ant-steps-icon-dot {
              background-color: #2a2a86;
            }
          }
          &-finish {
            .ant-steps-item-tail {
              top: 6px !important;
              &::after {
                background-color: #2a2a86 !important;
                margin-left: 0px !important;
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
            svg {
              width: 10px;
              height: 10px;
            }
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
  }
`;
