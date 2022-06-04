import styled from "styled-components";
import { primaryColor, successColor } from "utils/global-styles/variables";


export const AllOrdersMappingStyled = styled.div`
	.core-sub-status {
    color: #fff;
    border-radius: 100px;
    padding: 5px 15px;
    margin: 0 auto;
	}
  .coordinator_confirmed {
    background: #52D276;
  }
  .awaiting_coordinator_confirmation {
    background: #FCAF17;
  }
  .awaiting_saler_confirmation {
    background: #106227;
  }
  .first_call_attempt {
    background: #106227;
  }
  .second_call_attempt {
    background: #00897B;
  }
  .third_call_attempt {
    background: #E8770A;
  }
  .merchandise_packed {
    background: #E8770A;
  }
  .shipping {
    background: #00897B;
  }
  .awaiting_shipper {
    background: #106227;
  }
  .merchandise_picking {
    background: #C98D17;
  }
  .returned {
    background: #52D276;
  }
  .fourHour_delivery {
    background: ${primaryColor};
  }
  .shipped {
    background: ${successColor};
  }
  .order_return {
    background: #FCAF17;
  }
  .coordinator_confirming {
    background: #E8770A ;
  }
  .returning {
    background: #E8770A ;
  }
  .awaiting_coordinator_confirmation {
    background: #FCAF17;
  }
  .require_warehouse_change {
    background: #8D6E63;
  }
  .cancelled {
    background: #E24343;
  }
  .delivery_service_cancelled {
    background: #E24343;
  }
  .out_of_stock {
    background: #E24343;
  }
  .system_cancelled {
    background: #E24343;
  }

  .customer_cancelled {
    background-color: #E24343 !important;
  }
`;

export const AllOrdersMappingFilterStyled = styled.div`
  .order-filter {
    overflow-x: auto;
    margin-bottom: 5px;
    .ant-form {
      display: flex;
      .ant-form-item {
        margin-bottom: 5px;
      }
    }
  }
  
  .default-filter {
    display: flex;
    overflow-x: auto;
    .search-input {
      min-width: 100px;
      flex-grow: 1;
      margin-right: 15px;
    }
    .select-core-sub-status {
      min-width: 150px;
      margin-right: 15px;
    }
  }

  .action-dropdown {
    width: 110px;
    margin-right: 15px;
    .action-button {
      padding: 6px 15px;
      border-radius: 5px;
      display: flex;
      align-items: center;
      color: ${primaryColor};
      &:hover {
        color: ${primaryColor};
        border: 1px solid ${primaryColor};
        color: ${primaryColor};
      }
    }
  }

  .filter-tags {
    .tag {
      padding: 10px 20px;
      margin-bottom: 10px;
      background: rgba(42, 42, 134, 0.05);
      border-radius: 50px;
      white-space: normal;
    }
  }

  .ant-tag {
    margin-top: 0;
  }

  .select-shop-dropdown {
    min-width: 200px;
    margin-right: 15px;
    margin-left: 15px;
  }

  .ecommerce-dropdown {
    width: 160px;
    min-width: 140px;
    // margin-right: 10px;
    .ant-select-selector {
      padding: 0 10px;
      .ant-select-selection-item {
        display: flex;
        align-items: center;
      }
    }
  }
`;

export const StyledBaseFilter = styled.div`
  .select-connection-date {
    padding: 10px;
    border: 1px solid #d9d9d9;
    border-radius: 5px;

    .date-option {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      .ant-btn {
        width: 30%;
        padding: 0 10px;
        border-radius: 3px;
        background-color: #f5f5f5;
      }
      .ant-btn:hover {
        border-color: #2A2A86;
      }
      .active-btn {
        color: #FFFFFF;
        border-color: rgba(42, 42, 134, 0.1);
        background-color: #2A2A86;
      }
    }

  }
`;
