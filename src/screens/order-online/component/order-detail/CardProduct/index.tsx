//#region Import
import { Button, Card, Col, Divider, Row, Space, Table, Tag, Tooltip, Typography } from "antd";
import giftIcon from "assets/icon/gift.svg";
import storeBlueIcon from "assets/img/storeBlue.svg";
import { Type } from "config/type.config";
import UrlConfig from "config/url.config";
import {
  OrderDetailWithCalculatePointVariantModel,
  OrderLineItemResponse,
  OrderLineItemWithCalculateVariantPointModel,
  OrderResponse,
} from "model/response/order/order.response";
import discountCouponSuccess from "assets/icon/discount-coupon-success.svg";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { calculateVariantPointInOrderService } from "service/order/order.service";
import {
  formatCurrency,
  formatPercentage,
  getTotalQuantity,
  handleDisplayCoupon,
  handleFetchApiError,
  isFetchApiSuccessful,
} from "utils/AppUtils";
import couponOrderIcon from "assets/icon/coupon-order.svg";
import { successColor } from "utils/global-styles/variables";
import { StyledComponent } from "./styles";
import { DiscountUnitType } from "screens/promotion/constants";
import { OrderStatus, FulFillmentStatus } from "utils/Constants";
import { checkIfOrderSplit } from "utils/OrderUtils";

type PropTypes = {
  shippingFeeInformedCustomer: number | null;
  OrderDetail: OrderResponse | null;
  totalAmountReturnProducts?: number;
  paymentMethods: PaymentMethodResponse[];
  setVisibleOrderSplitModal?: (v: boolean) => void;
};

function UpdateProductCard(props: PropTypes) {
  const {
    shippingFeeInformedCustomer = 0,
    OrderDetail,
    totalAmountReturnProducts,
    paymentMethods,
  } = props;

  const [orderDetailCalculatePointInVariant, setOrderDetailCalculatePointInVariant] =
    useState<OrderDetailWithCalculatePointVariantModel | null>(null);

  const orderTotal = OrderDetail?.total || 0;

  const totalLineAmountBeforeLineDiscount = useMemo(() => {
    let result = 0;
    OrderDetail?.items.forEach((item) => {
      result = result + item.amount;
    });
    return result;
  }, [OrderDetail?.items]);

  const totalLineDiscountDiscount = useMemo(() => {
    let result = 0;
    OrderDetail?.items.forEach((item) => {
      let itemDiscountAmount = 0;
      if (item.discount_items && item.discount_items[0]?.amount) {
        itemDiscountAmount = item.discount_items[0].amount;
      }
      result = result + itemDiscountAmount;
    });
    return result;
  }, [OrderDetail?.items]);

  const dispatch = useDispatch();
  const productColumn = {
    title: () => (
      <div className="text-center">
        <div style={{ textAlign: "left" }}>Sản phẩm</div>
      </div>
    ),
    width: "35%",
    className: "yody-pos-name",
    render: (l: OrderLineItemResponse, item: any, index: number) => {
      const gift =
        props.OrderDetail?.items.filter(
          (item) =>
            item.position === l.position && item.type === Type.GIFT && l.type !== Type.SERVICE,
        ) || [];
      return (
        <div
          className="w-100"
          style={{
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="d-flex align-items-center">
            <div style={{ width: "calc(100% - 32px)", float: "left" }}>
              <div className="yody-pos-sku">
                <Link
                  target="_blank"
                  to={`${UrlConfig.PRODUCT}/${l.product_id}/variants/${l.variant_id}`}
                >
                  {l.sku}
                </Link>
              </div>
              <div
                className="yody-pos-varian"
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                <Tooltip title={l.variant} className="yody-pos-varian-name">
                  <span>{l.variant}</span>
                </Tooltip>
              </div>
            </div>
          </div>
          {gift.length > 0 &&
            gift[0]?.discount_items.length > 0 &&
            gift[0]?.discount_items[0]?.promotion_title && (
              <div className="yody-pos-addition yody-pos-gift 2">
                <div>
                  <Tag color="green">{gift[0]?.discount_items[0]?.promotion_title}</Tag>
                </div>
              </div>
            )}
          {props.OrderDetail?.items
            .filter(
              (item) =>
                item.position === l.position && item.type === Type.GIFT && l.type !== Type.SERVICE,
            )
            .map((gift) => {
              return (
                <>
                  <div key={gift.sku} className="yody-pos-addition yody-pos-gift 2">
                    <i>
                      <img src={giftIcon} alt="" /> {gift.variant} ({gift.quantity})
                    </i>
                  </div>
                </>
              );
            })}
          {l.note && (
            <div style={{ fontStyle: "italic", fontSize: "0.93em", marginTop: 5 }}>{l.note}</div>
          )}
          {/* lúc trước để tên khuyến mại vào reason, nên giờ thêm vào nếu ko có title */}
          {l.discount_items[0] && l.discount_items[0].promotion_id && (
            <div className="discount-item">
              {l.discount_items[0]?.discount_code && (
                <span className="coupon">{l.discount_items[0].discount_code} - </span>
              )}
              <img src={discountCouponSuccess} alt="" width={12} />{" "}
              {l.discount_items[0]?.promotion_title || l.discount_items[0]?.reason}
            </div>
          )}
        </div>
      );
    },
  };

  const amountColumn = {
    title: () => (
      <div className="text-center">
        <div>Số lượng</div>
        {/* <span style={{ color: "#2A2A86" }}>
          ({props.OrderDetail?.items && getTotalQuantity(props.OrderDetail?.items)})
        </span> */}
      </div>
    ),
    className: "yody-pos-quantity text-center 55",
    width: "10%",
    render: (l: OrderLineItemResponse, item: any, index: number) => {
      return <div className="yody-pos-qtt">{l.quantity}</div>;
    },
  };

  const priceColumn = {
    title: () => (
      <div>
        <span style={{ color: "#222222", textAlign: "right" }}>Đơn giá</span>
        <span style={{ color: "#808080", marginLeft: "6px", fontWeight: 400 }}>₫</span>
      </div>
    ),
    className: "yody-pos-price text-right 1",
    width: "15%",
    align: "right",
    render: (l: OrderLineItemResponse, item: any, index: number) => {
      return <div className="yody-pos-price">{formatCurrency(l.price)}</div>;
    },
  };

  const discountColumn = {
    title: () => (
      <div className="text-right">
        <div>Chiết khấu</div>
      </div>
    ),
    align: "right",
    width: "15%",
    className: "yody-table-discount text-right 32",
    render: (l: OrderLineItemResponse, item: any, index: number) => {
      return (
        <div>
          {l.discount_items.length > 0 && l.discount_items[0].amount !== null
            ? formatCurrency(l.discount_items[0].amount)
            : 0}
          {l.discount_items[0]?.rate ? (
            <div className="d-flex justify-content-end yody-table-discount-converted">
              <Typography.Text type="danger">
                <span style={{ fontSize: "0.857rem" }}>
                  {formatPercentage(Math.round(l.discount_items[0]?.rate * 100 || 0) / 100)}%
                </span>
              </Typography.Text>
            </div>
          ) : null}
        </div>
      );
    },
  };

  const pointColumn = {
    title: () => (
      <div className="text-right">
        <div>Tích điểm</div>
      </div>
    ),
    align: "right",
    width: "10%",
    className: "yody-table-point text-right 33",
    render: (l: OrderLineItemResponse, item: any, index: number) => {
      // console.log('item', item)
      return <div>{item?.point_add ? item.point_add : "-"}</div>;
    },
  };

  const totalPriceColumn = {
    title: () => (
      <div>
        <span style={{ color: "#222222" }}>Tổng tiền:</span>
        <span style={{ color: "#808080", marginLeft: "6px", fontWeight: 400 }}>₫</span>
      </div>
    ),
    align: "right",
    width: "15%",
    className: "yody-table-total-money text-right",
    render: (l: OrderLineItemResponse, item: any, index: number) => {
      return (
        <div className="yody-pos-varian-name">
          {formatCurrency(l.line_amount_after_line_discount)}
        </div>
      );
    },
  };

  const columns = [
    productColumn,
    amountColumn,
    priceColumn,
    discountColumn,
    pointColumn,
    totalPriceColumn,
  ];

  useEffect(() => {
    if (OrderDetail) {
      const customerId = OrderDetail.customer_id;
      const orderId = OrderDetail.id;
      if (customerId) {
        calculateVariantPointInOrderService(customerId, orderId)
          .then((response) => {
            if (isFetchApiSuccessful(response)) {
              let orderDetailResult: OrderDetailWithCalculatePointVariantModel = {
                ...OrderDetail,
                items: OrderDetail.items.map((item) => {
                  const foundItem =
                    response.data.find((single) => single.order_line_id === item.id) ||
                    response.data.find((single) => single.variant_id === item.variant_id);
                  return {
                    ...item,
                    point_add: foundItem?.point_add,
                    point_subtract: foundItem?.point_subtract,
                  };
                }),
              };
              setOrderDetailCalculatePointInVariant(orderDetailResult);
            } else {
              handleFetchApiError(response, "Tính điểm tiêu/tích đơn hàng", dispatch);
              setOrderDetailCalculatePointInVariant(OrderDetail);
            }
          })
          .catch(() => {
            setOrderDetailCalculatePointInVariant(OrderDetail);
          });
      }
    }
  }, [OrderDetail, dispatch, paymentMethods]);

  const getTotalLineItemsPointAdd = (lineItems: OrderLineItemWithCalculateVariantPointModel[]) => {
    return lineItems.reduce((a, b) => a + (b?.point_add || 0), 0);
  };

  return (
    <StyledComponent>
      <Card
        className="margin-top-20"
        title={
          <div className="d-flex">
            <span className="title-card">SẢN PHẨM</span>
          </div>
        }
        id="product_store_in_order"
        extra={
          <Row>
            <Space>
              {checkIfOrderSplit(OrderDetail) && (
                <div className="view-inventory-box">
                  <Button
                    ghost
                    onClick={() =>
                      props.setVisibleOrderSplitModal && props.setVisibleOrderSplitModal(true)
                    }
                  >
                    Tách đơn
                  </Button>
                </div>
              )}

              <div className="view-inventory-box">
                <Button type="link" className="p-0" style={{ color: "#000000" }}>
                  <Space>
                    <img src={storeBlueIcon} alt="" />
                    <Link
                      target="_blank"
                      to={`${UrlConfig.ORDER}?page=1&limit=30&store_ids=${OrderDetail?.store_id}`}
                    >
                      {OrderDetail?.store}
                    </Link>
                  </Space>
                </Button>
              </div>
            </Space>
          </Row>
        }
      >
        <div>
          <Row className="sale-product-box" justify="space-between">
            <Table
              id="product_store_in_order_table"
              locale={{
                emptyText: !OrderDetail ? (
                  <Button
                    type="text"
                    className="font-weight-500"
                    style={{
                      color: "#2A2A86",
                      background: "rgba(42,42,134,0.05)",
                      borderRadius: 5,
                      padding: 8,
                      height: "auto",
                      marginTop: 15,
                      marginBottom: 15,
                    }}
                  >
                    Thêm sản phẩm ngay (F3)
                  </Button>
                ) : null,
              }}
              rowKey={(record) => record.id}
              columns={columns}
              dataSource={orderDetailCalculatePointInVariant?.items.filter(
                (item) => item.type === Type.NORMAL || item.type === Type.SERVICE,
              )}
              className="sale-product-box-table2 w-100"
              tableLayout="fixed"
              pagination={false}
              footer={() =>
                orderDetailCalculatePointInVariant &&
                orderDetailCalculatePointInVariant?.items.length > 0 ? (
                  <div className="row-footer-custom">
                    <div
                      className="yody-foot-total-text"
                      style={{
                        width: "35%",
                        float: "left",
                        fontWeight: 700,
                        padding: "0 16px",
                      }}
                    >
                      TỔNG
                    </div>
                    <div
                      style={{
                        width: "10%",
                        float: "left",
                        textAlign: "center",
                        fontWeight: 400,
                      }}
                    >
                      {orderDetailCalculatePointInVariant?.items &&
                        getTotalQuantity(orderDetailCalculatePointInVariant?.items)}
                    </div>

                    <div
                      style={{
                        width: "15%",
                        float: "left",
                        textAlign: "right",
                        fontWeight: 400,
                        padding: "0 16px",
                      }}
                    >
                      {formatCurrency(
                        orderDetailCalculatePointInVariant?.items.reduce((a, b) => a + b.amount, 0),
                      )}
                    </div>
                    <div
                      style={{
                        width: "15%",
                        float: "left",
                        textAlign: "right",
                        fontWeight: 400,
                        padding: "0 16px",
                      }}
                    >
                      {formatCurrency(
                        orderDetailCalculatePointInVariant?.items.reduce(
                          (a, b) => a + (b.amount - b.line_amount_after_line_discount),
                          0,
                        ),
                      )}
                    </div>
                    <div
                      style={{
                        width: "10%",
                        float: "left",
                        textAlign: "right",
                        fontWeight: 400,
                        padding: "0 16px",
                      }}
                    >
                      {getTotalLineItemsPointAdd(orderDetailCalculatePointInVariant?.items) || "-"}
                    </div>
                    <div
                      style={{
                        width: "15%",
                        float: "left",
                        textAlign: "right",
                        color: "#000000",
                        fontWeight: 700,
                        padding: "0 16px",
                      }}
                    >
                      {formatCurrency(
                        orderDetailCalculatePointInVariant?.items.reduce(
                          (a, b) => a + b.line_amount_after_line_discount,
                          0,
                        ),
                      )}
                    </div>
                  </div>
                ) : (
                  <div />
                )
              }
            />
          </Row>

          <Row
            className="sale-product-box-payment"
            gutter={24}
            style={{ paddingTop: 20, paddingRight: "15px" }}
          >
            <Col xs={24} lg={12}>
              {/* <div className="payment-row">
              <Checkbox className="margin-bottom-15">Bỏ chiết khấu tự động</Checkbox>
            </div> */}
            </Col>
            <Col xs={24} lg={12}>
              <Row className="payment-row" justify="space-between">
                <div className="font-weight-500">Thành tiền:</div>
                <div className="font-weight-500">
                  {formatCurrency(totalLineAmountBeforeLineDiscount)}
                  {/* {props.OrderDetail?.total_line_amount_after_line_discount !== undefined &&
                  props.OrderDetail?.total_line_amount_after_line_discount !== null &&
                  formatCurrency(props.OrderDetail?.total_line_amount_after_line_discount)} */}
                </div>
              </Row>

              <Row className="payment-row" justify="space-between" align="middle">
                <Space align="center">
                  Chiết khấu đơn hàng:
                  {props.OrderDetail?.discounts && props.OrderDetail?.discounts.length > 0 && (
                    <div>
                      <Tag
                        style={{
                          marginTop: 0,
                          color: "#E24343",
                          backgroundColor: "#F5F5F5",
                        }}
                        className="orders-tag orders-tag-danger"
                      >
                        {props.OrderDetail?.discounts[0]?.rate
                          ? formatPercentage(props.OrderDetail?.discounts[0].rate)
                          : 0}{" "}
                        %
                      </Tag>
                    </div>
                  )}
                </Space>
                <div className="font-weight-400 ">
                  {props.OrderDetail?.discounts &&
                  props.OrderDetail?.discounts.length > 0 &&
                  props.OrderDetail?.discounts[0]?.amount !== null
                    ? formatCurrency(props.OrderDetail?.discounts[0].amount)
                    : "-"}
                </div>
              </Row>

              {OrderDetail?.discounts &&
                OrderDetail?.discounts[0] &&
                OrderDetail.discounts[0].promotion_id && (
                  <Row
                    className="payment-row"
                    justify="space-between"
                    align="middle"
                    style={{ fontSize: "0.95em", color: successColor, fontStyle: "normal" }}
                  >
                    <div className="promotionName" title="Tên chương trình khuyến mãi">
                      <img src={couponOrderIcon} alt="" />
                      {OrderDetail?.discounts[0]?.discount_code && (
                        <span className="coupon">
                          {OrderDetail?.discounts[0].discount_code}
                          <span className="separator">-</span>
                        </span>
                      )}
                      {OrderDetail.discounts[0]?.promotion_title ||
                        OrderDetail.discounts[0]?.reason}
                    </div>
                  </Row>
                )}

              {/* {OrderDetail?.discounts &&
              OrderDetail?.discounts[0] &&
              OrderDetail?.discounts[0].rate ? (
                <Row className="payment-row promotionRow" justify="space-between" align="middle">
                  <div className="promotionName">
                    <img src={couponOrderIcon} alt="" />
                    {OrderDetail?.discounts[0]?.discount_code && (
                      <span className="coupon">{OrderDetail?.discounts[0].discount_code} - </span>
                    )}
                    {OrderDetail.discounts[0]?.promotion_title || OrderDetail.discounts[0]?.reason}
                  </div>
                  <div className="font-weight-400 ">
                    {OrderDetail?.discounts[0].type === DiscountUnitType.PERCENTAGE.label
                      ? `${formatPercentage(OrderDetail?.discounts[0].rate)}%`
                      : formatCurrency(OrderDetail?.discounts[0].amount)}
                    <span className="rate secondaryValue">
                      (
                      {OrderDetail?.discounts[0].type === DiscountUnitType.PERCENTAGE.label
                        ? formatCurrency(OrderDetail?.discounts[0].amount)
                        : `${formatPercentage(OrderDetail?.discounts[0].rate)}%`}
                      )
                    </span>
                  </div>
                </Row>
              ) : null} */}

              <Row className="payment-row" justify="space-between" align="middle">
                <Space align="center">Tổng chiết khấu sản phẩm:</Space>
                <div className="font-weight-400 ">{formatCurrency(totalLineDiscountDiscount)}</div>
              </Row>

              <Row className="payment-row" justify="space-between">
                <div className="font-weight-500">Tổng chiết khấu đơn:</div>
                <div className="font-weight-500">
                  {props.OrderDetail?.total_discount
                    ? formatCurrency(props.OrderDetail?.total_discount)
                    : "-"}
                </div>
              </Row>

              {/* <Row className="payment-row" justify="space-between" align="middle">
                <Space align="center">Mã giảm giá:</Space>
                <div
                  className="font-weight-500 "
                  style={{ color: successColor, textTransform: "uppercase" }}
                >
                  {OrderDetail?.discounts && OrderDetail?.discounts[0]?.discount_code
                    ? handleDisplayCoupon(OrderDetail?.discounts[0]?.discount_code)
                    : "-"}
                </div>
              </Row> */}

              <Row className="payment-row" justify="space-between">
                <div className="font-weight-500 78">Phí ship báo khách:</div>
                <div className="font-weight-500 payment-row-money">
                  {shippingFeeInformedCustomer ? formatCurrency(shippingFeeInformedCustomer) : "-"}
                </div>
              </Row>
              <Divider className="margin-top-5 margin-bottom-5" />
              <Row className="payment-row" justify="space-between">
                <strong className="font-size-text 67 ">
                  {totalAmountReturnProducts ? "Tổng tiền hàng mua:" : "Khách phải trả:"}
                </strong>
                <strong className="totalAmount">{formatCurrency(orderTotal)}</strong>
              </Row>
              {totalAmountReturnProducts ? (
                <Row className="payment-row" justify="space-between">
                  <strong className="font-size-text">Tổng tiền hàng trả:</strong>
                  <strong>{formatCurrency(totalAmountReturnProducts)}</strong>
                </Row>
              ) : null}
              {totalAmountReturnProducts ? (
                <React.Fragment>
                  <Divider
                    className="margin-top-5 margin-bottom-5"
                    style={{ height: "auto", margin: " 5px 0" }}
                  />
                  <Row className="payment-row" justify="space-between">
                    <strong className="font-size-text 55" style={{ fontWeight: "bold" }}>
                      {orderTotal - totalAmountReturnProducts < 0
                        ? "Cần trả khách:"
                        : "Khách cần trả:"}
                    </strong>
                    <strong className="text-success font-size-price">
                      {formatCurrency(Math.abs(orderTotal - totalAmountReturnProducts))}
                    </strong>
                  </Row>
                </React.Fragment>
              ) : null}
            </Col>
          </Row>
        </div>
      </Card>
    </StyledComponent>
  );
}

export default UpdateProductCard;
