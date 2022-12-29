import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Divider, Row, Space, Tag, Tooltip, Typography } from "antd";
import { OrderDiscountRequest, OrderLineItemRequest } from "model/request/order.request";
import React, { useEffect, useState, useMemo } from "react";
import { formatCurrency, formatPercentage, handleDisplayCoupon } from "utils/AppUtils";
import { dangerColor, successColor } from "utils/global-styles/variables";
import { StyledComponent } from "./styles";
import discountCouponIcon from "assets/icon/discount-coupon.svg";
import couponOrderIcon from "assets/icon/coupon-order.svg";
import { DiscountValueType } from "model/promotion/price-rules.model";
import _ from "lodash";
import { DISCOUNT_TYPE } from "utils/Constants";

type PropTypes = {
  orderProductsAmount: number;
  items: OrderLineItemRequest[] | undefined;
  promotion: OrderDiscountRequest | null;
  totalAmountCustomerNeedToPay: number;
  shippingFeeInformedToCustomer?: number | null;
  totalOrderAmount: number;
  isAutomaticDiscount?: boolean;
  isCouponValid?: boolean;
  couponInputText?: string;
  levelOrder?: number;
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
  isEcommerceByOrderChannelCode?: boolean;
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
    isAutomaticDiscount,
    isCouponValid,
    showDiscountModal,
    showCouponModal,
    setPromotion,
    calculateChangeMoney,
    setCoupon,
    setCouponInputText,
    handleRemoveAllAutomaticDiscount,
    levelOrder = 0,
    isEcommerceByOrderChannelCode = false,
  } = props;

  const isDiscountItem = useMemo(() => {
    if (!items || (items && items.length === 0)) return false;
    return items?.some(
      (p) =>
        p.discount_items[0]?.promotion_id !== null &&
        p.discount_items[0]?.promotion_id !== undefined,
    );
  }, [items]);
  const discountRate = promotion?.rate || 0;
  const discountValue = promotion?.value || 0;
  const [isShowDiscountOrder, setIsShowDiscountOrder] = useState(false);

  console.log("promotion CardProductBottom", promotion);

  useEffect(() => {
    var element = document.getElementById(`promotion_order`);
    const handleClickOutside = (event: any) => {
      if (element && event.target !== element && !element.contains(event.target)) {
        setIsShowDiscountOrder(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
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
            <Space align="center" style={{ position: "relative" }} id="promotion_order">
              {/* ko disable chiết khấu tổng */}
              {setPromotion && items && items.length > 0 && !isDiscountItem ? (
                <Typography.Link
                  className="font-weight-400 discountTitle"
                  onClick={() => {
                    if (promotion) {
                      !isEcommerceByOrderChannelCode &&
                        setIsShowDiscountOrder(!isShowDiscountOrder);
                    } else {
                      showDiscountModal();
                    }
                  }}
                >
                  {promotion && promotion.promotion_id ? (
                    <>
                      <img src={couponOrderIcon} alt="" /> Áp dụng 1 chương trình khuyến mại{" "}
                      <InfoCircleOutlined />
                    </>
                  ) : (
                    <>
                      Chương trình khuyến mại <InfoCircleOutlined />
                    </>
                  )}
                </Typography.Link>
              ) : (
                <div>
                  Chương trình khuyến mại
                  <span className="noteTooltip">
                    <InfoCircleOutlined style={{ color: "#2a2a86" }} />
                  </span>
                </div>
              )}

              {items && discountRate !== 0 && isEcommerceByOrderChannelCode && (
                <Tag
                  key={discountRate}
                  className="orders-tag orders-tag-danger discountTag"
                  closable={true}
                  onClose={() => {
                    setCoupon && setCoupon("");
                    calculateChangeMoney(items, null);
                  }}
                >
                  {discountRate ? formatPercentage(discountRate) : 0}%{" "}
                </Tag>
              )}
              {promotion && promotion.promotion_id && isShowDiscountOrder && (
                <Card
                  title={
                    <>
                      <span>Khuyến mại đang áp dụng</span>
                      <CloseOutlined
                        onClick={() => {
                          setIsShowDiscountOrder(false);
                        }}
                      />
                    </>
                  }
                  className="discount-order-card"
                >
                  <Space direction="horizontal">
                    <span className="promotion-name">
                      <img src={discountCouponIcon} alt="" width={12} />{" "}
                      {promotion?.promotion_title}
                    </span>
                    <span className="promotion-value">
                      {promotion?.type === DISCOUNT_TYPE.PERCENT
                        ? `${formatPercentage(promotion?.rate ?? 0)} %`
                        : `${formatCurrency(promotion?.value ?? 0)} đ`}
                    </span>
                    <span className="promotion-value-after">
                      {formatCurrency(orderProductsAmount - (promotion?.value ?? 0))} đ
                    </span>
                    <Button
                      danger
                      ghost
                      onClick={() => {
                        setCoupon && setCoupon("");
                        items && calculateChangeMoney(items, null);
                        setIsShowDiscountOrder(false);
                      }}
                      disabled={levelOrder > 3}
                    >
                      Loại bỏ
                    </Button>
                  </Space>
                </Card>
              )}
            </Space>
            <div className="font-weight-500">
              {promotion && discountValue && discountRate ? (
                <>
                  {formatCurrency(discountValue)}{" "}
                  <span style={{ color: "red", fontWeight: 400 }}>
                    ({formatPercentage(discountRate)}%)
                  </span>
                </>
              ) : (
                "-"
              )}
            </div>
          </Row>

          {/* <Row className="paymentRow" justify="space-between" align="middle">
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
          </Row> */}

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
