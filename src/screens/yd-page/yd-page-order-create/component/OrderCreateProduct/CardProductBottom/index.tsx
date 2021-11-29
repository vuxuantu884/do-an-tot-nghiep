import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Col, Divider, Row, Tag, Typography } from "antd";
import { OrderLineItemRequest } from "model/request/order.request";
import React from "react";
import { formatCurrency, handleDisplayCoupon } from "utils/AppUtils";
import { StyledComponent } from "./styles";

type PropType = {
  levelOrder?: number;
  orderAmount: number;
  items: OrderLineItemRequest[] | undefined;
  discountRate?: number;
  discountValue?: number;
  totalAmountCustomerNeedToPay: number;
  coupon: string;
  shippingFeeInformedToCustomer?: number | null;
  changeMoney: number;
  amount: number;
  isDisableOrderDiscount?: boolean;
  isCouponValid?: boolean;
  showDiscountModal: () => void;
  showCouponModal: () => void;
  setDiscountRate?: (value: number) => void;
  setDiscountValue?: (value: number) => void;
  setCoupon?: (value: string) => void;
  calculateChangeMoney: (
    _items: Array<OrderLineItemRequest>,
    _amount: number,
    _discountRate: number,
    _discountValue: number
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
    items,
    discountRate,
    discountValue,
    coupon,
    // changeMoney,
    amount,
    shippingFeeInformedToCustomer,
    returnOrderInformation,
    totalAmountCustomerNeedToPay,
    isDisableOrderDiscount,
    isCouponValid,
    showDiscountModal,
    showCouponModal,
    setDiscountRate,
    setDiscountValue,
    calculateChangeMoney,
    setCoupon,
    handleRemoveAllDiscount,
  } = props;

// console.log('coupon33', coupon)
// console.log('discountRate', discountRate);
  return (
    <StyledComponent>
      <Row gutter={24}>
        {/* <Col xs={24} lg={11}>
          <div className="optionRow">
            <Checkbox className="" style={{ fontWeight: 500 }} disabled={levelOrder > 3} onChange={(e) =>setIsDisableAutomaticDiscount(e.target.value)}>
              Bỏ chiết khấu tự động
            </Checkbox>
          </div>
        </Col> */}
        <Col span={24}>
          <Row className="paymentRow" style={{justifyContent: "space-between"}}>
            <div className="font-weight-500 ">Tổng tiền:</div>
            <div className="font-weight-500">{formatCurrency(orderAmount)}</div>
          </Row>

          <Row className="payment-style" align="middle">
            <div >
              {setDiscountRate && !isDisableOrderDiscount && items && items.length > 0 ? (
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

              {items && discountRate!==0 && (
                <Tag
                  style={{
                    marginTop: 0,
                    color: "#E24343",
                    backgroundColor: "#F5F5F5",
                  }}
                  className="orders-tag orders-tag-danger"
                  closable
                  onClose={() => {
                    setCoupon && setCoupon("");
                    calculateChangeMoney(items, amount, 0, 0);
                  }}
                >
                  {discountRate ? discountRate : 0}%{" "}
                </Tag>
              )}
            </div>
            <div className="font-weight-500 ">
              {discountValue ? formatCurrency(discountValue) : "-"}
            </div>
          </Row>

          <Row className="paymentRow" justify="space-between" align="middle">
            <div>
              {setDiscountRate && !isDisableOrderDiscount && items && items.length > 0 ? (
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

              {coupon && coupon !== "" && (
                <Tag
                  style={{
                    margin: 0,
                    color: "#E24343",
                    backgroundColor: "#F5F5F5",
                  }}
                  className="orders-tag orders-tag-danger"
                  closable
                  onClose={() => {
                    setDiscountRate && setDiscountRate(0);
                    setDiscountValue && setDiscountValue(0);
                    handleRemoveAllDiscount();
                    setCoupon && setCoupon("");
                  }}
                >
                   {coupon ? isCouponValid ?
                                  <CheckCircleOutlined
                                      style={{
                                          color: '#27AE60',
                                          marginRight: 5
                                      }}
                                  />:
                                  <CloseCircleOutlined
                                      style={{
                                          color: "#E24343",
                                          marginRight: 5
                                      }}
                                  />: undefined
                              }
                  {handleDisplayCoupon(coupon)}
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
                <strong>{formatCurrency(orderAmount)}</strong>
              </Row>
              <Row className="payment-row" justify="space-between">
                <strong className="font-size-text">Tổng tiền hàng trả:</strong>
                <strong>
                  {returnOrderInformation.totalAmountReturn
                    ? formatCurrency(returnOrderInformation.totalAmountReturn)
                    : "-"}
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
              {formatCurrency(Math.abs(totalAmountCustomerNeedToPay))}
            </strong>
          </Row>
        </Col>
      </Row>
    </StyledComponent>
  );
}

export default CardProductBottom;
