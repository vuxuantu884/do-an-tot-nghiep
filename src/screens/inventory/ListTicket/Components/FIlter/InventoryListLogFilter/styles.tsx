import styled from "styled-components";

export const InventoryFiltersWrapper = styled.div`
  .ant-form-inline .ant-form-item {
    margin-right: 0px;
  }

  .page-filter-left {
    width: 110px;

    button {
      justify-content: space-between;
      width: 100%;
    }
  }

  .row-filter {
    width: 100%;
    & > .ant-col {
      & > .ant-form-item {
        width: 100%;
      }
    }
  }

  .ant-form-item-control-input-content {
    display: flex;
  }

  .page-filter {
    &-right {
      width: 100%;
      .ant-space {
        width: 100%;
        &-item {
          width: 100%;
          .ant-form {
            display: flex;
            width: 100%;
            &-item {
              margin-left: 16px;  
            }
            .search {
              flex: 3;
            }
            .store {
              flex: 1
            }
          }
        }
      }
    }

    .select-item {
      width: 10%;
      min-width: 150px;
    }
  }

  .order-options {
    border-bottom: 1px solid #5252;
    .ant-radio-group {
      .ant-radio-button-wrapper{
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
          width: 92%;
          .ant-space.ant-space-horizontal {
            width: 100%;
            .ant-space-item {
              width: 100%;
              
              .ant-form.ant-form-inline {
                display: flex;
                justify-content: space-between;
                .ant-form-item {
                  margin-right: 0;
  
                }
                .ant-btn-icon-only {
                  margin-left: 16px;
                }

                .input-search {
                  width: 55%;
                }

                @media screen and (max-width: 1850px) {
                  .input-search {
                    width: 50%;
                  }
                }
                @media screen and (max-width: 1600px) {
                  .input-search {
                    width: 40%;
                  }
                }
              }
            }
          }
          .ant-collapse>.ant-collapse-item>.ant-collapse-header {
            background-color: #f5f5f5;
          }
        }
      }
    }
  }
  .order-filter-tags {
    .tag {
      padding: 10px 10px;
      margin-bottom: 20px;
      background: rgba(42, 42, 134, 0.05);
      border-radius: 50px;
    }
  }
  
  .header-filter{
    font-weight: 500;
    color: #222222;
  }
`;

export const BaseFilterWrapper = styled.div`
  .ant-row {
    .ant-collapse-content-box {
      .date-option {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        .ant-btn {
          width: 30%;
        }
      }
      .button-option {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        .ant-btn {
          width: 48%;
        }
      }
    }
  }

  .price_min {
    width: 100%;
  }
  .price_max {
    width: 100%;
    border-left: none;
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
        background-color: #2A2A86;
        border-radius: 6px;
        font-style: normal;
        font-weight: normal;
        font-size: 14px;
        line-height: 18px;
        font-family: Roboto;
        .ant-select-selection-item-content, .ant-select-selection-item-remove {
          color: #FFFFFF;
        }
      }
    }
  }
  .active {
    color: #FFFFFF;
    border-color: rgba(42, 42, 134, 0.1);
    background-color: #2A2A86;
  }
  .deactive {
    color: #2a2a86;
    border-color: rgba(42, 42, 134, 0.05);
    background-color: rgba(42, 42, 134, 0.05);
  }
  
`;