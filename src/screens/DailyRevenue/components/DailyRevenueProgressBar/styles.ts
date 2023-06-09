import styled from "styled-components";
import { textBodyColor, textMutedColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .ant-steps-dot .ant-steps-item-content,
  .ant-steps-dot.ant-steps-small .ant-steps-item-content {
    margin-top: 2px;
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
  .create-bill-step .ant-steps-item-wait .ant-steps-item-tail::after {
    background-color: #d9d9e4 !important;
    margin-left: 0px !important;
  }
  .create-bill-step {
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
          width: 84px;
          flex: initial;
          &:first-child {
            .ant-steps-item-tail {
              width: 0;
            }
          }
          &:last-child {
            .ant-steps-item-container > .ant-steps-item-tail {
              display: block;
            }
          }
          &-tail {
            margin-left: -42px !important;
          }
          &-icon {
            width: 14px !important;
            height: 14px !important;
            margin-left: 35px !important;
            position: relative;
            z-index: 999;
          }
          &-description {
            color: #222 !important;
            margin-top: -3px;
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
                height: 3px !important;
              }
            }
            .ant-steps-icon-dot {
              background-color: #2a2a86 !important;
              top: 1px;
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
        background-color: #d9d9e4 !important;
        &::after {
          background-color: #d9d9e4 !important;
        }
      }
      .ant-steps-icon-dot {
        background-color: #e24343 !important;
      }
    }
    .returned {
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
