import styled from "styled-components";
import {borderColor, dangerColor, primaryColor, successColor, textBodyColor, textMutedColor, yellowColor} from "utils/global-styles/variables";

let nameQuantityWidth = 200;

export const StyledComponent = styled.div.attrs((props:any) => {
  // if(props.isShowOfflineOrder ) {
  //   quantityWidth = 50;
  //   nameWidth = 288;
  //   priceWidth = 120;
  //   nameQuantityWidth = window.screen.width > 1800 ? nameWidth+ quantityWidth + priceWidth : nameWidth+ quantityWidth + priceWidth + 15;
  // }
})`
  th {
    /* text-align: center !important; */
		padding: 12px 10px !important;
		justify-content: center !important;
		.separator {
			display: none;
		}
  }
  .productNameQuantityPriceHeader {
    > span {
      padding: 12px 10px !important;
    }
  }
  .ant-table-cell.customer-column,
  .ant-table-cell.productNameQuantityPrice,
  .ant-table-cell.orderStatus,
	.ant-table-cell.notes {
    padding: 0 !important;
  }
  td {
    position: relative;
  }
  .productNameQuantityPriceHeader {
    display: flex;
    justify-content: space-between;
  }
  .productNameQuantityPrice {
    width: ${nameQuantityWidth}px;
  }
  .productNameWidth {
    width: 60% ;
  }
  .quantityWidth {
    width: 15%;
    text-align: center;
  }
  .priceWidth {
    width: 25%;
    text-align: right;
		justify-content: flex-end;
		padding: 0 10px;
  }
  .item.custom-td {
    height: 100%;
    display: flex;
    justify-content: space-between;
    &:not(:last-child) {
      border-bottom: 1px solid ${borderColor};
    }
    .product {
      height: 100%;
      display: flex;
      align-items: center;
    }
    p {
      margin-bottom: 0;
    }
    .product,
    .quantity,
    .priceWidth {
      padding: 10px 10px;
    }
    .quantity,
    .priceWidth {
      white-space: nowrap;
      display: flex;
      align-items: center;
      position: relative;
      &:before {
        content: "";
        display: block;
        width: 1px;
        position: absolute;
        z-index: 1;
        top: -999px;
        bottom: -999px;
        left: 0;
        background-color: ${borderColor};
      }
    }
		.quantity {
			justify-content: center;
		}
    .price {
      white-space: nowrap;
      display: flex;
      align-items: center;
			justify-content: flex-end;
      &:before {
        // content: "";
        display: block;
        width: 1px;
        position: absolute;
        z-index: 1;
        top: -999px;
        bottom:-999px;
        left: 0;
        background-color: ${borderColor};
      }
    }
    .productNameText {
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
  .orderNotes span span.noteText,
  .textSmall {
    font-size: 0.86em;
    line-height: 1.25;
  }
  .orderId {
    .noWrap {
      white-space: nowrap;
    }
    .single {
      margin-top: 2px;
    }
  }
	.orderSource {
    margin-bottom: 9px;
	}
  .customer {
    .ant-btn {
      line-height: 15px;
      height: 15px;
      width: auto;
    }
  }
	.singlePayment {
		img {
			margin-right: 5px;
		}
    &.ydPoint {
      color: ${yellowColor};
    }
	}
  .amount {
    position: relative;
    top: 1px;
    font-weight: 500;
  }
	.notes {
		position: relative;
	}
	.orderNotes {
		.inner {
			height: 100%;
		}
		.single {
			height: 50%;
			display: flex;
			padding: 10px 10px;
			align-items: center;
			&:not(:last-child) {
				border-bottom: 1px solid ${borderColor};
			}
			.wrapper {
				display: flex;
			}
			svg {
				position: relative;
				top: 3px;
			}
		}
	}
	.orderStatus {
		.inner {
			height: 100%;
		}
		.single {
			padding: 10px 10px;
			&:not(:last-child) {
				border-bottom: 1px solid ${borderColor};
			}
      .ant-select-selection-item {
        font-size: ${13/14}em;
        font-weight: 500;
        color: #fff;
      }
      .ant-select-selector {
        color: #fff;
      }
      .ant-select-arrow {
        color: #fff;
      }
      .ant-select-single .ant-select-selector {
        padding-left: 5px;
        padding-right: 5px;
      }
      .coordinator-item{
        display: flex;
        flex-direction: column;
      }
		}
	}
	.shipmentType {
		.icon {
			margin-right: 5px;
		}
		.single {
			&:not(:last-child) {
				margin-bottom: 2px;
			}
			img {
				max-width: 85px;
				margin-right: 5px;
				position: relative;
				top: -2px;
				&.iconShipping {
					top: 0
				}
			}
		}
	}
  .ant-table {
    .ant-table-footer {
      background: #fff;
      padding: 0;
      .tableFooter {
        padding: 30px 0 20px 0;
      }
      .text-field {
        font-weight: 500;
        display: inline-block;
      }
      .hasIcon {
        .iconShippingFeeInformedToCustomer {
          position: relative;
          top: -2px;
        }
        .iconShippingFeePay3PL {
          position: relative;
          top: -1px;
        }
        span {
          display: flex;
          align-items: center;
        }
        img {
          margin-right: 8px;
        }
      }
    }
    .trackingCode {
      word-break: break-all ;
      color: ${primaryColor};
      font-weight: 500;
      cursor: pointer;
    }
    .trackingCodeImg {
      cursor: pointer;
      margin-right: 5px;
    }
    .ant-select {
      margin-top: 5px;
      &.coordinator_confirmed {
        .ant-select-selector {
          background: #01b0f1 !important;
        }
      }
      &.awaiting_coordinator_confirmation {
        .ant-select-selector {
          color: #fff;
          background: #FCAF17 !important;
        }
        .ant-select-arrow {
          color: #fff;
        }
        &.ant-select-single.ant-select-open .ant-select-selection-item {
          color: #fff;
        }
      }
      &.first_call_attempt,
      &.second_call_attempt,
      &.third_call_attempt {
        .ant-select-selector {
          color: ${textBodyColor};
          background: #ffff00 !important;
        }
        .ant-select-arrow {
          color: ${textBodyColor};
        }
        .ant-select-selection-item {
          color: ${textBodyColor};
        }
      }
      &.shipping,
      &.fourHour_delivery {
        .ant-select-selector {
          color: #fff;
          background: #008081 !important;
        }
        .ant-select-arrow {
          color: #fff;
        }
        .ant-select-selection-item {
          color: #fff;
        }
      }
      &.awaiting_shipper {
        .ant-select-selector {
          background: #ff0066 !important;
        }
      }
      &.shipped {
        .ant-select-selector {
          color: #fff;
          background: ${successColor} !important;
        }
        .ant-select-arrow {
          color: #fff;
        }
        .ant-select-selection-item {
          color: #fff;
        }
      }
      &.order_return {
        .ant-select-selector {
          color: #fff;
          background: #FCAF17 !important;
        }
        .ant-select-arrow {
          color: #fff;
        }
        &.ant-select-single.ant-select-open .ant-select-selection-item {
          color: #fff;
        }
      }
      &.coordinator_confirming,
      &.awaiting_saler_confirmation {
        .ant-select-selector {
          background: #fe9900  !important;
        }
      }
      &.awaiting_coordinator_confirmation {
        .ant-select-selector {
          color: #fff;
          background: #01b0f1 !important;
        }
        .ant-select-arrow {
          color: #fff;
        }
        .ant-select-selection-item {
          color: #fff;
        }
      }
      &.require_warehouse_change,
      &.merchandise_packed,
      &.merchandise_picking {
        .ant-select-selector {
          background: #9b2531 !important;
        }
      }
      &.cancelled {
        .ant-select-selector {
          background: #E24343 !important;
        }
      }
      &.compensate {
        .ant-select-selector {
          background: #7030a0 !important;
        }
      }
      &.customer_cancelled,
      &.delivery_service_cancelled,
      &.system_cancelled,
      &.out_of_stock {
        .ant-select-selector {
          background: #a6a6a6 !important;
        }
      }
      &.delivery_fail,
      &.returning,
      &.confirm_returned,
      &.returned {
        .ant-select-selector {
          background: #fe0000 !important;
        }
      }
    }
    .orderTotalPaymentAmount {
      color: ${successColor};
      font-weight: 500;
    }
    .orderTotalLeftAmount {
      color: ${dangerColor};
      font-weight: 500;
    }
    .ant-table-selection-column {
      padding-left: 6px !important;
      padding-right: 6px !important;
    }
    .ant-select:not(.ant-select-customize-input) .ant-select-selector {
      height: 34px;
      .ant-select-selection-item {
        line-height: 34px;
      }
    }
    .customTags {
      display: flex;
      flex-wrap: wrap;
      input {
        border: none;
        outline: none;
        color: #222222;
        line-height: 1;
        margin: 2px 0;
        flex: 1;
        &::-webkit-input-placeholder {
          font-size: 14px;
          color: #b4b4b4;
        }
      }
      div {
        display: flex;
        background-color: ${primaryColor};
        border-radius: 3px;
        color: #fff;
        margin: 2px;
        padding: 4px 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        & > img {
          display: block;
          width: 14px;
          cursor: pointer;
          margin-left: 3px;
        }
        span {
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
  .poppver-to-fast {
    .btn-to-fast {
      padding: "0px"; 
      display:"block"; 
      height:"24px";
    }
  }
  .checkInventoryButton {
    padding: 0;
    height: auto;
    line-height: 1;
    width: auto;
  }
  .iconReturn {
    width: 20px
  }
  .isReturn {
    text-align: center;
  }
  .actionButton {
    &:not(:last-child) {
      margin-bottom: 5px;
    }
  }
  .mainColor,
  .mainColor a {
    color: ${primaryColor};
  }
  .orderTotal {
    // color: ${successColor};
    font-weight: bold;
  }
  .previewImage {
    margin-right: 6px;
  }
  .originalPrice {
    color: ${textMutedColor};
    text-decoration: line-through ;
  }
`;

export {nameQuantityWidth}