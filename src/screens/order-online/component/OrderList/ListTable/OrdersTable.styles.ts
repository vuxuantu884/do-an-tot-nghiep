import styled from "styled-components";
import {borderColor} from "utils/global-styles/variables";
export const nameQuantityWidth = 290;
const quantityWidth = 50;
const massWidth = 100;
const priceWidth = 100;
const nameWidth = nameQuantityWidth - quantityWidth - priceWidth;

export const StyledComponent = styled.div`
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
  .productNameQuantityPriceHeader {
    display: flex;
    justify-content: space-between;
  }
  .productNameWidth {
    width: ${nameWidth}px;
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
      span[role="img"] {
        margin-right: 5px;
      }
    }
  }
`;
