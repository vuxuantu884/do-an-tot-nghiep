import styled from "styled-components";
import { borderColor } from "utils/global-styles/variables";

const nameQuantityWidth = 500;
const quantityWidth = 50;
const massWidth = 100;
const priceWidth = 120;
const nameWidth = nameQuantityWidth - quantityWidth - priceWidth;

export const HistoryPurchaseStyled = styled.div`
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
			justify-content: center;
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
  
`;


