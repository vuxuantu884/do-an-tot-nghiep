import styled from "styled-components";
import { primaryColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .video-react-big-play-button {
    // display: none !important;
    top: 45% !important;
    left: 35% !important;
  }

  .videos {
    display: flex;
    flex-wrap: wrap;

    .video {
      margin-right: 5px;
    }
  }
  .videos-list {
    .ant-space-item {
      width: 300px;
    }
  }
  .feedbacks-filter {
    .page-filter {
      .page-filter-heading {
        width: 100%;
        display: inline-flex;
        justify-content: space-between;
        .page-filter-left {
          width: 8%;
          min-width: 100px;
          .ant-space {
            display: inline-flex;
            vertical-align: middle;
          }
        }
        .page-filter-right {
          width: 88%;
          .ant-space.ant-space-horizontal {
            width: 100%;
            .ant-space-item {
              width: 100%;
  
              .ant-form.ant-form-inline {
                position: relative;
                padding-right: 80px;
                display: block;
                display: flex;
                // justify-content: space-between;
                justify-content: flex-end;
                .ant-form-item {
                  // margin-right: 0;
                }
                button {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
                .buttonGroup {
                  position: absolute;
                  top: 0;
                  z-index: 1;
                  right: 0;
                  display: flex;
                  align-items: center;
                  width: 80px;
                  justify-content: space-between;
                  button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  }
                  [role="img"] {
                    vertical-align: middle;
                  }
                  .anticon-setting svg {
                    vertical-align: middle;
                  }
                }
                [role="img"] {
                  vertical-align: middle;
                }
                .anticon-setting svg {
                  vertical-align: middle;
                }
                @media screen and (min-width: 1400px) {
                  .input-search {
                    width: 70%;
                  }
                }
                @media screen and (max-width: 1399px) {
                  .input-search {
                    width: 60%;
                  }
                }
                @media screen and (max-width: 1099px) {
                  .input-search {
                    width: 50%;
                  }
                }
                @media screen and (max-width: 799px) {
                  .input-search {
                    width: 40%;
                  }
                }
              }
            }
          }
          .ant-collapse > .ant-collapse-item > .ant-collapse-header {
            background-color: #f5f5f5;
          }
        }
          .ant-collapse > .ant-collapse-item > .ant-collapse-header {
            background-color: #f5f5f5;
          }
        }
      }
    }
  }
  .feedbacks-filter-tags {
    /* margin-bottom: 10px; */
    .tag {
      padding: 4px 10px;
      margin-bottom: 15px;
      background: rgba(42, 42, 134, 0.05);
      border-radius: 50px;
      max-width: 100%;
      white-space: initial;
    }
    .tagLabel {
      margin-right: 5px;
    }
    a {
      color: ${primaryColor};
      &:hover {
        text-decoration: underline;
      }
    }
    span[role="img"] {
      margin-left: 5px;
      cursor: pointer;
    }
    .expandText {
      color: ${primaryColor};
      cursor: pointer;
    }
  }

  feedbacks-filter-drawer {
  }
  .ant-drawer-content {
    .ant-drawer-header {
      padding: 12px 20px;
    }
    .ant-drawer-body {
      .body-container-form {
        padding: 20px;
      }
    }

    .ant-drawer-footer {
      background: #ffffff;
      box-shadow: 0px -1px 8px rgba(0, 0, 0, 0.1);
    }
  }

  .header-filter {
    font-weight: 500;
    color: #222222;
  }
  .formInner {
    width: 400px;
    max-width: 100%;
  }
  .buttonWrapper {
    margin-top: 28px;
    display: flex;
    justify-content: flex-end;
    button {
      &:not(:last-child) {
        margin-right: 10px;
      }
    }
  }
  .actions {
    display: flex;
    button {
      &:not(:last-child) {
        margin-right: 20px;
      }
      border-color: #2A2A86;
      background-color: #F3F3FF;
      color: #2A2A86;
    }
  }

  .ant-divider {
    position: absolute;
    margin: 14px 0 0 -16px;
  }
`;
