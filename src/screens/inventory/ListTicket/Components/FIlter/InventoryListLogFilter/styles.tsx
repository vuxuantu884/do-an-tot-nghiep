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