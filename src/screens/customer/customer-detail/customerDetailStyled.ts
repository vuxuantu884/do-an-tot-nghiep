import styled from "styled-components";
import { StyledCustomerInfo } from "screens/customer/customerStyled";
import {borderColor, dangerColor, primaryColor, successColor} from "utils/global-styles/variables";


// Inherit StyledCustomerInfo in StyledCustomerDetail
export const StyledCustomerDetail = styled(StyledCustomerInfo)`
  .action-button {
    padding: 6px 15px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    color: ${primaryColor};
    &:hover {
      border: 1px solid ${primaryColor};
      color: ${primaryColor};
    }
  }

  .customer-status {
    margin: 0 10px;
    padding: 2px 15px;
    font-size: 12px;
    font-weight: 400;
    color: #ffffff;
    border-radius: 15px;
    &.active {
      background-color: #27AE60;
    }
    &.inactive {
      background-color: #676767;
    }
  }

  .customer-info {
    .point-info {

    }
  }

  .detail-info {
    display: flex;
    margin-bottom: 12px;
    color: #222222;

    .title {
      display: flex;
      justify-content: space-between;
      width: 40%;
    }
    .content {
      margin-left: 10px;
      width: 60%;
      overflow-wrap: break-word;
      font-weight: 500;
    }
    .link {
      color: #2a2a86;
      text-decoration: none;
      background-color: transparent;
      outline: none;
      cursor: pointer;
      transition: color .3s;
      &:hover {
        color: #1890ff;
        text-decoration: underline;
      }
    }
  }
  
  .show-more {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .action {
      cursor: pointer;
        margin-left: 10px;
    }
    .dash {
      width: 85%;
      border-bottom: 1px dashed #E5E5E5;
    }
  }

  .point-info {
    width: 25%;
    .title {
      width: 50%;
    }
    .content {
      width: 50%;
    }
  }

  .purchase-info {
    .item-info {
      display: flex;
      margin-bottom: 12px;
      padding-right: 20px;
      color: #222222;
    }
  }

  .extended-info {
    .ant-card-body {
      padding: 0 20px;
    }
    .tabs-list {
      overflow: initial;
      .ant-tabs-nav {
        padding: 0;
      }
    }
  }

  .order-reason {
    text-align: center;
    &-heading {
      font-weight: 600;
    }
    &-content {
      padding-left: 3px;
    }
  }
`

export const nameQuantityWidth = 200;
// const quantityWidth = 50;
// const massWidth = 100;
// const priceWidth = 100;
// const nameWidth = nameQuantityWidth - quantityWidth - priceWidth;

export const StyledPurchaseHistory = styled.div`
	.filter-line {
		width: 100%;
		display: flex;
		align-items: center;
		.search-variant {
			flex-grow: 1;
		}
	}
	
  th {
    text-align: center !important;
		padding: 12px 5px !important;
		justify-content: center !important;
		.separator {
			display: none;
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
  .order-return-background {
    background-color: rgb(239, 239, 252); 
    .ant-table-cell-fix-left, .ant-table-cell-fix-right {
      background-color: rgb(239, 239, 252);
    }
  }

  .ant-table-tbody>tr.order-return-background:hover>td {
    background-color: rgb(239, 239, 252);
  }

  .ant-table-tbody>tr.order-return-background>td {
    transition: unset;
  }

  .ant-table.ant-table-bordered>.ant-table-container>.ant-table-body>table>tbody>tr>td {
    border-right: 1px solid #ddd;
  }

  .ant-table .ant-table-expanded-row-fixed {
    padding: 10px 16px 16px 16px;
  }

  .productNameQuantityPriceHeader {
    display: flex;
    justify-content: space-between;
  }
  .productNameWidth {
    width: 60% ;
  }
  .quantityWidth {
    width: 15%;
    text-align: center;
    position: relative;
  }
  .priceWidth {
    width: 30%;
    text-align: center;
		justify-content: flex-end;
		padding: 0 10px;
  }
  .ant-table-cell {
    overflow: hidden;
  }
  .custom-td {
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
	.orderSource {
		margin-top: 9px;
	}
	.singlePayment {
		img {
			margin-right: 5px;
		}
		.amount {
			position: relative;
			top: 1px;
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
				margin-bottom: 5px;
			}
			img {
				max-width: 100%;
				margin-right: 5px;
				position: relative;
				top: -2px;
				&.iconShipping {
					top: 0
				}
			}
		}
	}

  .expanded-row-render {
    margin-left: 6px;
    margin-bottom: 20px;
    width: 1100px;
    .custom-table .ant-table.ant-table-middle .ant-table-thead > tr > th {
      background-color: #ffffff;
    }
  }

  .orderTotalLeftAmount {
    color: ${dangerColor};
    font-weight: 500;
  }
  .textSmall {
    font-size: 0.86em;
    line-height: 1.25;
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
    &.coordinator_confirming {
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
    &.delivery_fail,
    &.compensate,
    &.customer_cancelled,
    &.delivery_service_cancelled {
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
    &.out_of_stock {
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
    &.system_cancelled {
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
  .noWrap {
    white-space: nowrap;
  }
  .plus-point{
    color: rgb(39, 174, 96);
    font-weight: 500;
  }
  .minus-point{
    color: rgb(226, 67, 67);
    font-weight: 500;
  }
  .text-return-status{
    text-align: left;
    padding: 10px;
    //color:rgb(39, 174, 96) !important;
    font-weight: 500;
  }
  .status-order{
    box-sizing: border-box;
    margin: 0;
    padding: 6px 10px;
    font-size: 14px;
    font-variant: tabular-nums;
    list-style: none;
    font-feature-settings: "tnum";
    position: relative;
    display: inline-block;
    overflow: hidden;
    color: #fff;
    white-space: nowrap;
    text-align: left;
    vertical-align: middle;
    background: #ccc;
    width: 160px;
  }
`;

export const StyledActivityLog = styled.div`
  .link {
    color: #2A2A86;
    text-decoration: none;
    background-color: transparent;
    outline: none;
    cursor: pointer;
    transition: color .3s;
    &:hover {
      color: #1890ff;
      text-decoration: underline;
    }
  }
  
  .activity-log-detail-modal {
    .log-detail-modal-body {
      height: 500px;
      overflow: scroll;
      padding: 10px 20px;
    }
  }
`;

export const StyledActivityLogDetailModal = styled.div`
  .log-detail-modal-body {
    max-height: 500px;
    overflow: auto;
    .log-detail-update {
      display: flex;
      justify-content: space-between;
			.old-data {
				flex-grow: 1;
				margin-right: 20px;
			}
			.new-data {
        flex-grow: 1;
			}
      .label {
        margin-bottom: 10px;
      }
    }
    .content {
      background: #eee;
      padding: 10px;
      margin-bottom: 0;
			white-space: pre-wrap;
    }
  }
`;
