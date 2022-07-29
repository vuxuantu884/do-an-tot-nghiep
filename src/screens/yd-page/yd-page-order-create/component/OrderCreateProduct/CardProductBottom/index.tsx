import { CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { Col, Divider, Row, Tag, Tooltip, Typography } from "antd";
import { OrderDiscountRequest, OrderLineItemRequest } from "model/request/order.request";
import React from "react";
import {formatCurrency, formatPercentage, handleDisplayCoupon} from "utils/AppUtils";
import { StyledComponent } from "./styles";

type PropType = {
	levelOrder?: number;
	orderAmount: number;
	items: OrderLineItemRequest[] | undefined;
	promotion: OrderDiscountRequest | null;
	discountValue?: number;
	totalAmountCustomerNeedToPay: number;
	shippingFeeInformedToCustomer?: number | null;
	changeMoney: number;
	amount?: number;
	totalAmountOrder: number;
	isDisableOrderDiscount?: boolean;
	isCouponValid?: boolean;
	couponInputText?: string;
	showDiscountModal: () => void;
	showCouponModal: () => void;
	setPromotion?: (value: OrderDiscountRequest | null) => void;
	setCoupon?: (value: string) => void;
	setCouponInputText?: (value: string) => void;
	calculateChangeMoney: (
		_items: Array<OrderLineItemRequest>,
		_promotion?: OrderDiscountRequest | null | undefined
	) => void;
	returnOrderInformation?: {
		totalAmountReturn: number;
	};
	handleRemoveAllAutomaticDiscount: () => void;
};

function CardProductBottom(props: PropType) {
	const {
		// levelOrder = 0,
		orderAmount,
		totalAmountOrder,
		items,
		promotion,
		couponInputText,
		// changeMoney,
		shippingFeeInformedToCustomer,
		returnOrderInformation,
		totalAmountCustomerNeedToPay,
		isDisableOrderDiscount,
		isCouponValid,
		showDiscountModal,
		showCouponModal,
		setPromotion,
		calculateChangeMoney,
		setCoupon,
		setCouponInputText,
		handleRemoveAllAutomaticDiscount,
	} = props;

	let discountRate = promotion?.rate || 0;
	let discountValue = promotion?.value || 0;

	return (
		<StyledComponent>
      <Row gutter={24}>
				{/* <Col xs={24} lg={13}>
					<div className="optionRow">
            <Checkbox className="" style={{ fontWeight: 500 }} disabled={levelOrder > 3} onChange={(e) =>setIsDisableAutomaticDiscount(e.target.value)}>
              Bỏ chiết khấu tự động
            </Checkbox>
          </div>
				</Col> */}
				<Col xs={24}>
          <Row className="paymentRow" style={{justifyContent: "space-between"}}>
            <div className="font-weight-500 ">Tổng tiền:</div>
            <div className="font-weight-500">{formatCurrency(orderAmount)}</div>
          </Row>

					<Row className="paymentRow" style={{justifyContent: "space-between"}} align="middle">
						<div style={{display: "flex", alignItems: "center"}}>
							{/* ko disable chiết khấu tổng */}
              {(setPromotion && !isDisableOrderDiscount && items && items.length > 0) || true ? (
                <Typography.Link
                  className="font-weight-400"
                  onClick={showDiscountModal}
                  style={{
                    textDecoration: "underline",
                    textDecorationColor: "#5D5D8A",
                    color: "#5D5D8A",
                  }}
                >
                  Chiết khấu:
                </Typography.Link>
              ) : (
                <div>Chiết khấu:</div>
              )}

							{items && discountRate !== 0 && (
								<Tag
									key={discountRate}
									style={{
										marginTop: 0,
                    marginLeft: 5,
										color: "#E24343",
										backgroundColor: "#F5F5F5",
									}}
									className="orders-tag orders-tag-danger"
									closable={!isDisableOrderDiscount}
									onClose={() => {
										setCoupon && setCoupon("");
										calculateChangeMoney(items, null);
									}}
								>
									{discountRate ? formatPercentage(discountRate) : 0}%{" "}
								</Tag>
							)}
            </div>
            <div className="font-weight-500 ">
              {discountValue ? formatCurrency(discountValue) : "-"}
            </div>
					</Row>

					<Row className="paymentRow" justify="space-between" align="middle">
						<div>
							{setPromotion && !isDisableOrderDiscount && items && items.length > 0 ? (
								<Typography.Link
									className="font-weight-400"
									onClick={showCouponModal}
									style={{
										textDecoration: "underline",
										textDecorationColor: "#5D5D8A",
										color: "#5D5D8A",
									}}
								>
									Mã giảm giá:
								</Typography.Link>
							) : (
								<div>
									<Tooltip title="Tắt chiết khấu tự động để nhập mã giảm giá" >
										Mã giảm giá
										<span style={{margin: "0 0 0 5px"}}>
											<InfoCircleOutlined />
										</span>
									</Tooltip>
								</div>
							)}

							{couponInputText && couponInputText !== "" && (
								<Tag
									style={{
										margin: 0,
										color: "#E24343",
										backgroundColor: "#F5F5F5",
										textTransform: "uppercase",
									}}
									className="orders-tag orders-tag-danger"
									closable
									onClose={() => {
										setPromotion && setPromotion(null)
										handleRemoveAllAutomaticDiscount();
										setCoupon && setCoupon("");
										setCouponInputText && setCouponInputText("");
									}}
								>
									{couponInputText ? (
										isCouponValid ? (
											<React.Fragment>
												<CheckCircleOutlined
													style={{
														color: "#27AE60",
														marginRight: 5,
													}}
												/>
												<span style={{ color: "#27AE60" }}>{handleDisplayCoupon(couponInputText)}</span>
											</React.Fragment>
										) : (
											<React.Fragment>
												<CloseCircleOutlined
													style={{
														color: "#E24343",
														marginRight: 5,
													}}
												/>
												<span style={{ color: "#E24343" }}>{handleDisplayCoupon(couponInputText)}</span>
											</React.Fragment>
										)
									) : undefined}
								</Tag>
							)}
						</div>
						<div className="font-weight-500 ">-</div>
					</Row>

					<Row className="paymentRow" justify="space-between">
						<div>Phí ship báo khách:</div>
						<div className="font-weight-500 paymentRow-money">
							{shippingFeeInformedToCustomer
								? formatCurrency(shippingFeeInformedToCustomer)
								: "-"}
						</div>
					</Row>
					{/* render khi đổi trả */}
					{returnOrderInformation && (
						<React.Fragment>
							<Divider className="margin-top-5 margin-bottom-5" />
							<Row className="payment-row" justify="space-between">
								<strong className="font-size-text">Tổng tiền hàng mua:</strong>
								<strong>{totalAmountOrder && formatCurrency(totalAmountOrder)}</strong>
							</Row>
							<Row className="payment-row" justify="space-between">
								<strong className="font-size-text">Tổng tiền hàng trả:</strong>
								<strong>
									{formatCurrency(returnOrderInformation.totalAmountReturn)}
								</strong>
							</Row>
						</React.Fragment>
					)}
					<Divider className="margin-top-5 margin-bottom-5" />
					<Row className="paymentRow" justify="space-between">
						<strong className="font-size-text">
							{totalAmountCustomerNeedToPay >= 0 || !returnOrderInformation
								? `Khách cần phải trả:`
								: `Cần trả lại khách:`}
						</strong>
						<strong className="text-success font-size-price">
							{totalAmountCustomerNeedToPay >= 0 || !returnOrderInformation
								? !returnOrderInformation ? formatCurrency(totalAmountOrder > 0 ? totalAmountOrder : 0) : formatCurrency(Math.abs(totalAmountOrder - returnOrderInformation.totalAmountReturn))
								: formatCurrency(Math.abs(totalAmountCustomerNeedToPay))}
						</strong>
					</Row>
				</Col>
			</Row>
		</StyledComponent>
	);
}

export default CardProductBottom;
