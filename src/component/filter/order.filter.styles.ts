import styled from "styled-components";
import { primaryColor } from "utils/global-styles/variables";

export const StyledComponent = styled.div`
  .order-options {
    border-bottom: 1px solid #5252;
    .ant-radio-group {
      .ant-radio-button-wrapper {
        border-style: none;
        border-width: 0;
        box-shadow: none;
        height: 40px;
      }
      .ant-radio-button-wrapper:first-child {
        border-left: none;
        border-radius: none;
      }
      .ant-radio-button-wrapper:not(:first-child):before {
        width: 0;
      }
      .ant-radio-button-wrapper-checked {
        color: #2a2a86;
        border-bottom: 2px solid #2a2a86;
      }
    }
  }
  .order-filter {
    .page-filter {
      .page-filter-heading {
        width: 100%;
        display: inline-flex;
        justify-content: space-between;
        .page-filter-left {
          width: 8%;
          min-width: 100px;
        }
        .page-filter-right {
          width: 88%;
					padding-left: 20px;
          .ant-space.ant-space-horizontal {
            width: 100%;
            .ant-space-item {
              width: 100%;

              .ant-form.ant-form-inline {
                position: relative;
								padding-right: 310px;
								display: block;
								.buttonGroup {
									position: absolute;
									top: 0;
									z-index: 1;
									right: 0;
									display: flex;
									align-items: center;
									button {
										margin-right: 15px;
									}
								}
								.input-search {
									width: 100%;
								}
              }
            }
          }
          .ant-collapse > .ant-collapse-item > .ant-collapse-header {
            background-color: #f5f5f5;
          }
        }
      }
    }
  }
  .order-filter-tags {
		margin-bottom: 20px;
    .tag {
      padding: 10px 10px;
      margin-bottom: 15px;
      background: rgba(42, 42, 134, 0.05);
      border-radius: 50px;
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
  }

  .order-filter-drawer {
    .ant-drawer-content {
      .ant-drawer-header {
        padding: 12px 20px;
      }
      .ant-drawer-body {
        .body-container-form {
          padding: 20px;
        }
      }
      .ant-form {
        p {
          color: #222222;
          font-weight: 500;
          margin-bottom: 5px;
        }
        .ant-row {
          .ant-form-item {
            margin: 0 0 20px;
          }
          .date-option {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            .ant-btn {
              width: 30%;
              padding: 0px 5px;
              height: 33.5px;
              line-height: 29px;
            }
          }
          .ant-picker {
            height: 40px;
          }
          .date-range {
            display: flex;
            .swap-right-icon {
              width: 10%;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              .anticon-swap-right {
                font-size: 23px;
                color: #757575;
              }
            }
          }
          .button-option-1 {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            .ant-btn {
              width: 48%;
              height: 40px;
            }
          }
          .button-option-2 {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            .ant-btn {
              width: 30%;
              padding: 0px 5px;
              height: 40px;
              line-height: 29px;
            }
          }
        }
      }
      .price_min {
        width: 100%;
      }
      .price_max {
        width: 100%;
      }
      #price_min {
        border-right: none;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }

      #price_max {
        border-left: none;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
      .ant-select {
        .ant-select-selector {
          .ant-select-selection-item {
            background-color: #2a2a86;
            border-radius: 6px;
            font-style: normal;
            font-weight: normal;
            font-size: 14px;
            line-height: 18px;
            font-family: Roboto;
            .ant-select-selection-item-content,
            .ant-select-selection-item-remove {
              color: #ffffff;
            }
          }
        }
      }
      .active {
        color: #ffffff;
        border-color: rgba(42, 42, 134, 0.1);
        background-color: #2a2a86;
      }
      .deactive {
        color: #2a2a86;
        border-color: rgba(42, 42, 134, 0.05);
        background-color: rgba(42, 42, 134, 0.05);
      }
      .ant-drawer-footer {
        background: #ffffff;
        box-shadow: 0px -1px 8px rgba(0, 0, 0, 0.1);
      }
    }
  }

  .header-filter {
    font-weight: 500;
    color: #222222;
  }

  .order-filter-drawer-pack {
    .ant-drawer-content {
      .ant-drawer-header {
        padding: 12px 20px;
      }
      .ant-drawer-body {
        .body-container-form {
          padding: 20px;
        }
      }
      .ant-form {
        p {
          color: #222222;
          font-weight: 500;
          margin-bottom: 5px;
        }
        .ant-row {
          .ant-form-item {
            margin: 0 0 20px;
          }
          .date-option {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            .ant-btn {
              width: 30%;
              padding: 0px 5px;
              height: 33.5px;
              line-height: 29px;
            }
          }
          .ant-picker {
            height: 40px;
          }
          .date-range {
            display: flex;
            .swap-right-icon {
              width: 10%;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              .anticon-swap-right {
                font-size: 23px;
                color: #757575;
              }
            }
          }
          .button-option-1 {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            .ant-btn {
              width: 48%;
              height: 40px;
            }
          }
          .button-option-2 {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            .ant-btn {
              width: 30%;
              padding: 0px 5px;
              height: 40px;
              line-height: 29px;
            }
          }
        }
      }
      .price_min {
        width: 100%;
      }
      .price_max {
        width: 100%;
      }
      #price_min {
        border-right: none;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }

      #price_max {
        border-left: none;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
      .active {
        color: #ffffff;
        border-color: rgba(42, 42, 134, 0.1);
        background-color: #2a2a86;
      }
      .deactive {
        color: #2a2a86;
        border-color: rgba(42, 42, 134, 0.05);
        background-color: rgba(42, 42, 134, 0.05);
      }
      .ant-drawer-footer {
        background: #ffffff;
        box-shadow: 0px -1px 8px rgba(0, 0, 0, 0.1);
      }
    }
  }

  .dupticate-filter > .page-filter {
    padding: 10px 0px 10px 0px !important;
  }
`;
