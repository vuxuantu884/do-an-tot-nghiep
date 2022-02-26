import styled from "styled-components";

export const InventoryFiltersWrapper = styled.div`
.custom-filter {
  .page-filter {
    padding-top: 20px;
  }
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

  .site-input-split {
    width: 10%;
    text-align: center;
    height: 38px;
    padding: 7px;
    border: 1px solid #d9d9d9;
    color: #d9d9d9;
    border-left: unset;
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
  
  .label {
    margin-top: 10px;
    padding-bottom: 8px;
    font-weight: 500;
  }
  
  .label-date {
    padding-bottom: 8px;
    font-weight: 500;
  }
`;
