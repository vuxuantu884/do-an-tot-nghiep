import styled from "styled-components";
import {borderColor, primaryColor, successColor, yellowColor} from "utils/global-styles/variables";
export const nameQuantityWidth = 310;
const quantityWidth = 50;
const massWidth = 100;
const priceWidth = 100;
const nameWidth = nameQuantityWidth - quantityWidth - priceWidth;

export const StyledComponent = styled.div`
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
    width: ${nameWidth + 32}px ;
  }
  .quantityWidth {
    width: ${quantityWidth}px;
    text-align: center;
  }
  .massWidth {
    width: ${massWidth}px;
    text-align: center;
  }
  .priceWidth {
    width: ${priceWidth}px;
    text-align: center;
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
      padding: 10px 10px;
      height: 100%;
      display: flex;
      align-items: center;
    }
    p {
      margin-bottom: 0;
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
        right: ${quantityWidth}px;
        background-color: ${borderColor};
      }
    }
		.quantity {
			justify-content: center;
		}
    .mass {
      white-space: nowrap;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      &:before {
        content: "";
        display: block;
        width: 1px;
        position: absolute;
        z-index: 1;
        top: 0px;
        bottom: 0px;
        right: ${massWidth}px;
        background-color: ${borderColor};
      }
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
        right: ${priceWidth}px;
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
    .single {
      margin-top: 2px;
    }
  }
	.orderSource {
		margin-top: 9px;
	}
  .customer {
    .ant-btn {
      line-height: 15px;
      height: 15px;
    }
  }
	.singlePayment {
		img {
			margin-right: 5px;
		}
		.amount {
			position: relative;
			top: 1px;
      font-weight: 500;
		}
    &.ydPoint {
      color: ${yellowColor};
    }
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
			padding: 10px;
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
			padding: 10px;
			&:not(:last-child) {
				border-bottom: 1px solid ${borderColor};
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
				max-width: 105px;
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
          color: #fff;
          background: #52D276 !important;
        }
        .ant-select-arrow {
          color: #fff;
        }
        &.ant-select-single.ant-select-open .ant-select-selection-item {
          color: #fff;
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
      &.awaiting_saler_confirmation {
        .ant-select-selector {
          color: #fff;
          background: #106227 !important;
        }
        .ant-select-arrow {
          color: #fff;
        }
        &.ant-select-single.ant-select-open .ant-select-selection-item {
          color: #fff;
        }
      }
      &.first_call_attempt {
        .ant-select-selector {
          color: #fff;
          background: #106227 !important;
        }
        .ant-select-arrow {
          color: #fff;
        }
        &.ant-select-single.ant-select-open .ant-select-selection-item {
          color: #fff;
        }
      }
      &.second_call_attempt {
        .ant-select-selector {
          color: #fff;
          background: #00897B !important;
        }
        .ant-select-arrow {
          color: #fff;
        }
        &.ant-select-single.ant-select-open .ant-select-selection-item {
          color: #fff;
        }
      }
      &.third_call_attempt {
        .ant-select-selector {
          color: #fff;
          background: #E8770A !important;
        }
        .ant-select-arrow {
          color: #fff;
        }
        &.ant-select-single.ant-select-open .ant-select-selection-item {
          color: #fff;
        }
      }
      &.merchandise_packed {
        .ant-select-selector {
          color: #fff;
          background: #E8770A !important;
        }
        .ant-select-arrow {
          color: #fff;
        }
        &.ant-select-single.ant-select-open .ant-select-selection-item {
          color: #fff;
        }
      }
      &.shipping {
        .ant-select-selector {
          color: #fff;
          background: #00897B !important;
        }
        .ant-select-arrow {
          color: #fff;
        }
        &.ant-select-single.ant-select-open .ant-select-selection-item {
          color: #fff;
        }
      }
      &.awaiting_shipper {
        .ant-select-selector {
          color: #fff;
          background: #106227 !important;
        }
        .ant-select-arrow {
          color: #fff;
        }
        &.ant-select-single.ant-select-open .ant-select-selection-item {
          color: #fff;
        }
      }
      &.merchandise_picking {
        .ant-select-selector {
          color: #fff;
          background: #C98D17 !important;
        }
        .ant-select-arrow {
          color: #fff;
        }
        &.ant-select-single.ant-select-open .ant-select-selection-item {
          color: #fff;
        }
      }
      &.returned {
        .ant-select-selector {
          color: #fff;
          background: #52D276 !important;
        }
        .ant-select-arrow {
          color: #fff;
        }
        &.ant-select-single.ant-select-open .ant-select-selection-item {
          color: #fff;
        }
      }
      &.fourHour_delivery {
        .ant-select-selector {
          color: #fff;
          background: ${primaryColor} !important;
        }
        .ant-select-arrow {
          color: #fff;
        }
        &.ant-select-single.ant-select-open .ant-select-selection-item {
          color: #fff;
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
        &.ant-select-single.ant-select-open .ant-select-selection-item {
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
      &.returning {
        .ant-select-selector {
          color: #fff;
          background: #E8770A  !important;
        }
        .ant-select-arrow {
          color: #fff;
        }
        &.ant-select-single.ant-select-open .ant-select-selection-item {
          color: #fff;
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
      &.require_warehouse_change {
        .ant-select-selector {
          color: #fff;
          background: #8D6E63 !important;
        }
        .ant-select-arrow {
          color: #fff;
        }
        &.ant-select-single.ant-select-open .ant-select-selection-item {
          color: #fff;
        }
      }
      &.cancelled {
        .ant-select-selector {
          color: #fff;
          background: #E24343 !important;
        }
        .ant-select-arrow {
          color: #fff;
        }
        &.ant-select-single.ant-select-open .ant-select-selection-item {
          color: #fff;
        }
      }
    }
    .orderTotalPaymentAmount {
      color: ${successColor};
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
`;
