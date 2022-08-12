import { CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { Col, Divider, Row, Space, Tag, Tooltip, Typography } from "antd";
import { OrderDiscountRequest, OrderLineItemRequest } from "model/request/order.request";
import React from "react";
import { formatCurrency, formatPercentage, handleDisplayCoupon } from "utils/AppUtils";
import { dangerColor, successColor } from "utils/global-styles/variables";
import { StyledComponent } from "./styles";

type PropTypes = {
  orderProductsAmount: number;
  items: OrderLineItemRequest[] | undefined;
  promotion: OrderDiscountRequest | null;
  totalAmountCustomerNeedToPay: number;
  shippingFeeInformedToCustomer?: number | null;
  totalOrderAmount: number;
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
    _promotion?: OrderDiscountRequest | null | undefined,
  ) => void;
  returnOrderInformation?: {
    totalAmountReturn: number;
  };
  handleRemoveAllAutomaticDiscount: () => void;
};

function CardProductBottom(props: PropTypes) {
  const {
    orderProductsAmount,
    totalOrderAmount,
    items,
    promotion,
    couponInputText,
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

  const discountRate = promotion?.rate || 0;
  const discountValue = promotion?.value || 0;

  return (
    <StyledComponent>
      <Row gutter={24}>
        <Col xs={24} lg={13}></Col>
        <Col xs={24} lg={10}>
          <Row className="paymentRow" justify="space-between">
            <div>Tổng tiền:</div>
            <div className="font-weight-500">{formatCurrency(orderProductsAmount)}</div>
          </Row>

          <Row className="paymentRow" justify="space-between" align="middle">
            <Space align="center">
              {/* ko disable chiết khấu tổng */}
              {(setPromotion && !isDisableOrderDiscount && items && items.length > 0) || true ? (
                <Typography.Link
                  className="font-weight-400 discountTitle"
                  onClick={showDiscountModal}
                >
                  Chiết khấu:
                </Typography.Link>
              ) : (
                <div>
                  <Tooltip title="Tắt chiết khấu tự động để nhập chiết khấu đơn hàng">
                    Chiết khấu
                    <span className="noteTooltip">
                      <InfoCircleOutlined />
                    </span>
                  </Tooltip>
                </div>
              )}

              {items && discountRate !== 0 && (
                <Tag
                  key={discountRate}
                  className="orders-tag orders-tag-danger discountTag"
                  closable={!isDisableOrderDiscount}
                  onClose={() => {
                    setCoupon && setCoupon("");
                    calculateChangeMoney(items, null);
                  }}
                >
                  {discountRate ? formatPercentage(discountRate) : 0}%{" "}
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
                <Typography.Link className="font-weight-400 couponTitle" onClick={showCouponModal}>
                  Mã giảm giá:
                </Typography.Link>
              ) : (
                <div>
                  <Tooltip title="Tắt chiết khấu tự động để nhập mã giảm giá">
                    Mã giảm giá
                    <span className="noteTooltip">
                      <InfoCircleOutlined />
                    </span>
                  </Tooltip>
                </div>
              )}

              {couponInputText && couponInputText !== "" && (
                <Tag
                  className="orders-tag orders-tag-danger couponTag--danger"
                  closable
                  onClose={() => {
                    setPromotion && setPromotion(null);
                    handleRemoveAllAutomaticDiscount();
                    setCoupon && setCoupon("");
                    setCouponInputText && setCouponInputText("");
                  }}
                >
                  {couponInputText ? (
                    isCouponValid ? (
                      <React.Fragment>
                        <CheckCircleOutlined className="couponTag__icon couponTag__icon--success" />
                        <span style={{ color: successColor }}>
                          {handleDisplayCoupon(couponInputText)}
                        </span>
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <CloseCircleOutlined className="couponTag__icon couponTag__icon--danger" />
                        <span style={{ color: dangerColor }}>
                          {handleDisplayCoupon(couponInputText)}
                        </span>
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
                ? `Khách cần phải trả:`
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
