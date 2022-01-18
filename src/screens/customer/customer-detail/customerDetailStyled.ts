import styled from "styled-components";
import { StyledCustomerInfo } from "screens/customer/customerStyled";
import { borderColor } from "utils/global-styles/variables";

// Inherit StyledCustomerInfo in StyledCustomerDetail
export const StyledCustomerDetail = styled(StyledCustomerInfo)`
  .action-button {
    padding: 6px 15px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    color: $primary-color;
    &:hover {
      border: 1px solid $primary-color;
      color: $primary-color;
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
        margin-bottom: 20px;
        padding: 0;
      }
    }
  }

`;

export const nameQuantityWidth = 400;
const quantityWidth = 50;
const massWidth = 100;
const priceWidth = 100;
const nameWidth = nameQuantityWidth - quantityWidth - priceWidth;

export const StyledPurchaseHistory = styled.div`
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
  .custom-shadow-td-bg {
    background-color: rgb(239, 239, 252); 
    .ant-table-cell-fix-left, .ant-table-cell-fix-right {
      background-color: rgb(239, 239, 252);
    }
  }

  .ant-table-tbody>tr.custom-shadow-td-bg:hover>td {
    background-color: rgb(239, 239, 252);
  }

  .ant-table-tbody>tr.custom-shadow-td-bg>td {
    transition: unset;
  }

  .ant-table.ant-table-bordered>.ant-table-container>.ant-table-body>table>tbody>tr>td,
  .ant-table.ant-table-bordered>.ant-table-container>.ant-table-header>table>thead>tr>th{
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
    width: ${nameWidth}px;
    &:before {
      content: "";
        display: block;
        width: 1px;
        position: absolute;
        z-index: 1;
        top: 0;
        bottom: 0;
        right: ${quantityWidth + priceWidth}px;
        background-color: ${borderColor};
    }
  }
  .quantityWidth {
    width: ${quantityWidth}px;
    text-align: center;
    &:before {
      content: "";
        display: block;
        width: 1px;
        position: absolute;
        z-index: 1;
        top: 0;
        bottom: 0;
        right: ${priceWidth}px;
        background-color: ${borderColor};
    }
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
      &:before {
        content: "";
        display: block;
        width: 1px;
        position: absolute;
        z-index: 1;
        top: 0;
        bottom: 0;
        right: ${quantityWidth + priceWidth}px;
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
      &:before {
        content: "";
        display: block;
        width: 1px;
        position: absolute;
        z-index: 1;
        top: 0;
        bottom: 0;
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
        content: "";
        display: block;
        width: 1px;
        position: absolute;
        z-index: 1;
        top: 0;
        bottom: 0;
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
`;
