import { Col, Divider, Row } from "antd";
import { OrderDiscountRequest, OrderLineItemRequest } from "model/request/order.request";
import React from "react";
import { formatCurrency } from "utils/AppUtils";
import { StyledComponent } from "./styles";
import PromotionApply from "./PromotionApply";

type PropTypes = {
  items: OrderLineItemRequest[] | undefined;
  orderProductsAmount: number;
  promotion: OrderDiscountRequest | null;
  totalAmountCustomerNeedToPay: number;
  shippingFeeInformedToCustomer?: number | null;
  totalOrderAmount: number;
  levelOrder?: number;
  showDiscountModal: () => void;
  calculateChangeMoney: (
    _items: Array<OrderLineItemRequest>,
    _promotion?: OrderDiscountRequest | null | undefined,
  ) => void;
  returnOrderInformation?: {
    totalAmountReturn: number;
  };
  isCustomOriginalHandmadeDiscount?: boolean;
  orderType?: string;
};

function CardProductBottom(props: PropTypes) {
  const {
    orderProductsAmount,
    totalOrderAmount,
    promotion,
    shippingFeeInformedToCustomer,
    returnOrderInformation,
    totalAmountCustomerNeedToPay,
  } = props;

  console.log("promotion CardProductBottom", promotion);

  return (
    <StyledComponent>
      <Row gutter={24}>
        <Col xs={24} lg={13}></Col>
        <Col xs={24} lg={10}>
          <Row className="paymentRow" justify="space-between">
            <div>Tổng tiền:</div>
            <div className="font-weight-500">{formatCurrency(orderProductsAmount)}</div>
          </Row>
          <PromotionApply
            isEcommerceByOrderChannelCode={props.isCustomOriginalHandmadeDiscount}
            items={props.items}
            promotion={props.promotion}
            levelOrder={props.levelOrder}
            showDiscountModal={props.showDiscountModal}
            calculateChangeMoney={props.calculateChangeMoney}
            orderType={props.orderType}
          />

          <Row className="paymentRow" justify="space-between">
            <div>Phí ship báo khách:</div>
            <div className="font-weight-500 paymentRow-money">
              {shippingFeeInformedToCustomer ? formatCurrency(shippingFeeInformedToCustomer) : "-"}
            </div>
          </Row>
          {/* render khi đổi trả */}
          {returnOrderInformation && (
            <React.Fragment>
              <Divider className="margin-top-5 margin-bottom-5" />
              <Row className="payment-row" justify="space-between">
                <strong className="font-size-text 23">Tổng tiền hàng mua:</strong>
                <strong>{totalOrderAmount && formatCurrency(totalOrderAmount)}</strong>
              </Row>
              <Row className="payment-row" justify="space-between">
                <strong className="font-size-text">Tổng tiền hàng trả:</strong>
                <strong>{formatCurrency(returnOrderInformation.totalAmountReturn)}</strong>
              </Row>
            </React.Fragment>
          )}
          <Divider className="margin-top-5 margin-bottom-5" />
          <Row className="paymentRow" justify="space-between">
            <strong className="font-size-text">
              {totalAmountCustomerNeedToPay >= 0 || !returnOrderInformation
                ? `Khách phải trả:`
                : `Cần trả lại khách:`}
            </strong>
            <strong className="text-success font-size-price">
              {totalAmountCustomerNeedToPay >= 0 || !returnOrderInformation
                ? !returnOrderInformation
                  ? formatCurrency(totalOrderAmount > 0 ? totalOrderAmount : 0)
                  : formatCurrency(
                      Math.abs(totalOrderAmount - returnOrderInformation.totalAmountReturn),
                    )
                : formatCurrency(Math.abs(totalAmountCustomerNeedToPay))}
            </strong>
          </Row>
        </Col>
      </Row>
    </StyledComponent>
  );
}

export default CardProductBottom;
