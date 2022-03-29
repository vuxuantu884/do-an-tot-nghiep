import styled from "styled-components";

export const InventoryShipmentWrapper = styled.div`
  .shipment_date {
    width: 100%;
    align-items: center;

    .ant-form-item {
      margin: 0;
    }

    .ant-col {
      display: flex;
      align-items: center;

      .orders-shipment__dateLabel {
        margin-right: 12px;
      }
    }
  }
  
  .error-mess {
    color: #ff4d4f;
    margin-top: 10px;
  }

  .custom-table {
    width: 100%;
  }
  .logoHVC {
    width: 100px;
  }
  .ant {
    &-btn-lg {
      padding-top: 4px;
      padding-bottom: 4px;
      height: 38px;
      margin-right: 0;
    }
    &-radio-inner {
      width: 18px;
      height: 18px;
      border: 1px solid #2a2a86;
      &::after {
        background-color: #2a2a86;
        width: 10px;
        height: 10px;
      }
    }

    &-radio-checked {
      &::after {
        border: 1px solid #2a2a86;
      }
    }
  }
  .ant-radio:hover .ant-radio-inner {
    border: 1px solid #2a2a86;
  }
  .ant-radio-input:focus + .ant-radio-inner,
  .ant-radio-wrapper:hover .ant-radio,
  .ant-radio:hover .ant-radio-inner {
    border-color: #2a2a86;
  }
`;
