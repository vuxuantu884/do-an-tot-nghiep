import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Col, Divider, Row, Space, Tag, Typography } from "antd";
import { OrderDiscountRequest, OrderLineItemRequest } from "model/request/order.request";
import React from "react";
import { formatCurrency, handleDisplayCoupon } from "utils/AppUtils";
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
	handleRemoveAllDiscount: () => void;
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
		handleRemoveAllDiscount,
	} = props;

	// console.log('isDisableOrderDiscount', isDisableOrderDiscount)

	let discountRate = promotion?.rate || 0;
	let discountValue = promotion?.value || 0;

	console.log('totalAmountOrder', totalAmountOrder)
	console.log('isCouponValid', isCouponValid)

	// console.log('coupon33', coupon)
	// console.log('discountRate', discountRate);
	return (
		<StyledComponent>
			<Row gutter={24}>
				<Col xs={24} lg={11}>
					{/* <div className="optionRow">
            <Checkbox className="" style={{ fontWeight: 500 }} disabled={levelOrder > 3} onChange={(e) =>setIsDisableAutomaticDiscount(e.target.value)}>
              Bỏ chiết khấu tự động
            </Checkbox>
          </div> */}
				</Col>
				<Col xs={24} lg={10}>
					<Row className="paymentRow" style={{ justifyContent: "space-between" }}>
						<div>Tổng tiền:</div>
						<div className="font-weight-500" style={{ fontWeight: 500 }}>
							{formatCurrency(orderAmount)}
						</div>
					</Row>

					<Row className="paymentRow" justify="space-between" align="middle">
						<Space align="center">
							{setPromotion && !isDisableOrderDiscount && items && items.length > 0 ? (
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
									{discountRate ? Math.round(discountRate * 100) / 100 : 0}%{" "}
								</Tag>
							)}
						</Space>
						<div className="font-weight-500 ">
							{discountValue ? formatCurrency(discountValue) : "-"}
						</div>
					</Row>

					<Row className="paymentRow" justify="space-between" align="middle">
						<Space align="center">
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
								<div>Mã giảm giá:</div>
							)}

							{couponInputText && couponInputText !== "" && (
								<Tag
									style={{
										margin: 0,
										color: "#E24343",
										backgroundColor: "#F5F5F5",
									}}
									className="orders-tag orders-tag-danger"
									closable
									onClose={() => {
										setPromotion && setPromotion(null)
										handleRemoveAllDiscount();
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
						</Space>
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
							{totalAmountCustomerNeedToPay >= 0
								? `Khách cần phải trả:`
								: `Cần trả lại khách:`}
						</strong>
						<strong className="text-success font-size-price">
							{totalAmountCustomerNeedToPay >= 0
								? !returnOrderInformation ? formatCurrency(Math.abs(totalAmountOrder)) : formatCurrency(Math.abs(totalAmountOrder - returnOrderInformation.totalAmountReturn))
								: formatCurrency(Math.abs(totalAmountCustomerNeedToPay))}
						</strong>
					</Row>
				</Col>
			</Row>
		</StyledComponent>
	);
}

export default CardProductBottom;
