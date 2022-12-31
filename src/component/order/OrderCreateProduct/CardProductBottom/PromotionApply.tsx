import { CloseOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { Button, Card, Row, Space, Tag, Typography } from "antd";
import { OrderDiscountRequest, OrderLineItemRequest } from "model/request/order.request";
import React, { useEffect, useMemo, useState } from "react";
import { StyledComponent } from "./styles";
import couponOrderIcon from "assets/icon/coupon-order.svg";
import { formatCurrency, formatPercentage, totalAmount } from "utils/AppUtils";
import discountCouponIcon from "assets/icon/discount-coupon.svg";
import { DISCOUNT_TYPE } from "utils/Constants";

type Props = {
  isEcommerceByOrderChannelCode?: boolean;
  items: OrderLineItemRequest[] | undefined;
  promotion: OrderDiscountRequest | null;
  levelOrder?: number;
  showDiscountModal: () => void;
  calculateChangeMoney: (
    _items: Array<OrderLineItemRequest>,
    _promotion?: OrderDiscountRequest | null | undefined,
  ) => void;
};
const PromotionApply: React.FC<Props> = (props: Props) => {
  const {
    items,
    isEcommerceByOrderChannelCode = false,
    promotion,
    levelOrder = 0,
    showDiscountModal,
    calculateChangeMoney,
  } = props;

  const discountRate = promotion?.rate || 0;
  const discountValue = promotion?.value || 0;
  const orderProductsAmount = useMemo(() => (items ? totalAmount(items) : 0), [items]);
  const [isShowDiscountOrder, setIsShowDiscountOrder] = useState(false);
  const isDiscountItem = useMemo(() => {
    if (!items || (items && items.length === 0)) return false;
    return items?.some(
      (p) =>
        p.discount_items[0]?.promotion_id !== null &&
        p.discount_items[0]?.promotion_id !== undefined,
    );
  }, [items]);

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

  const ClosePromotionIdNotExist = () => {
    return (
      <React.Fragment>
        {items && discountRate !== 0 && levelOrder <= 3 && !promotion?.promotion_id && (
          <Tag
            key={discountRate}
            className="orders-tag orders-tag-danger discountTag"
            closable={true}
            onClose={() => {
              calculateChangeMoney(items, null);
            }}
          >
            {discountRate ? formatPercentage(discountRate) : 0}%{" "}
          </Tag>
        )}
      </React.Fragment>
    );
  };

  const ClosePromotionIdExist = () => {
    return (
      <React.Fragment>
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
                <img src={discountCouponIcon} alt="" width={12} /> {promotion?.promotion_title}
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
                  // setCoupon && setCoupon("");
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
      </React.Fragment>
    );
  };
  return (
    <StyledComponent>
      <Row className="paymentRow" justify="space-between" align="middle">
        <Space align="center" style={{ position: "relative" }} id="promotion_order">
          {/* ko disable chiết khấu tổng */}
          {items && items.length > 0 && !isDiscountItem ? (
            <Typography.Link
              className="font-weight-400 discountTitle"
              onClick={() => {
                if (promotion) {
                  !isEcommerceByOrderChannelCode && setIsShowDiscountOrder(!isShowDiscountOrder);
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

          <ClosePromotionIdNotExist />
          <ClosePromotionIdExist />
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
    </StyledComponent>
  );
};
export default PromotionApply;
