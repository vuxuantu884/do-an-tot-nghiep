//#region Import
import {
	Button,
	Card, Col,
	Divider,
	Row,
	Space,
	Table,
	Tag,
	Tooltip
} from "antd";
import giftIcon from "assets/icon/gift.svg";
import storeBluecon from "assets/img/storeBlue.svg";
import { Type } from "config/type.config";
import UrlConfig from "config/url.config";
import {
	OrderLineItemResponse,
	OrderResponse
} from "model/response/order/order.response";
import React from "react";
import { Link } from "react-router-dom";
import { formatCurrency, getTotalQuantity, handleDisplayCoupon } from "utils/AppUtils";
import { dangerColor } from "utils/global-styles/variables";
//#endregion

type ProductCardUpdateProps = {
  shippingFeeInformedCustomer: number | null;
  OrderDetail: OrderResponse | null;
  customerNeedToPayValue: any;
  totalAmountReturnProducts?: number;
};
const UpdateProductCard: React.FC<ProductCardUpdateProps> = (
  props: ProductCardUpdateProps
) => {
  const { OrderDetail, totalAmountReturnProducts, customerNeedToPayValue = 0 } = props;
  const ProductColumn = {
    title: () => (
      <div className="text-center">
        <div style={{ textAlign: "left" }}>Sản phẩm</div>
      </div>
    ),
    width: "40%",
    className: "yody-pos-name",
    render: (l: OrderLineItemResponse, item: any, index: number) => {
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
          {props.OrderDetail?.items
            .filter((item) => item.position === l.position && item.type === Type.GIFT)
            .map((gift) => (
              <div key={gift.sku} className="yody-pos-addition yody-pos-gift">
                <i>
                  <img src={giftIcon} alt="" /> {gift.variant} ({gift.quantity})
                </i>
              </div>
            ))}
					{l.note && (
						<div style={{fontStyle: "italic", fontSize: "0.93em", marginTop: 5}}>{l.note}</div>
					)}
        </div>
      );
    },
  };

  const AmountColumnt = {
    title: () => (
      <div className="text-center">
        <div>Số lượng</div>
        {/* <span style={{ color: "#2A2A86" }}>
          ({props.OrderDetail?.items && getTotalQuantity(props.OrderDetail?.items)})
        </span> */}
      </div>
    ),
    className: "yody-pos-quantity text-center",
    width: "15%",
    render: (l: OrderLineItemResponse, item: any, index: number) => {
      return <div className="yody-pos-qtt">{l.quantity}</div>;
    },
  };

  const PriceColumnt = {
    title: () => (
      <div>
        <span style={{ color: "#222222", textAlign: "right" }}>Đơn giá</span>
        <span style={{ color: "#808080", marginLeft: "6px", fontWeight: 400 }}>₫</span>
      </div>
    ),
    className: "yody-pos-price text-right",
    width: "15%",
    align: "right",
    render: (l: OrderLineItemResponse, item: any, index: number) => {
      return <div className="yody-pos-price">{formatCurrency(l.price)}</div>;
    },
  };

  const DiscountColumnt = {
    title: () => (
      <div className="text-right">
        <div>Chiết khấu</div>
      </div>
    ),
    align: "right",
    width: "15%",
    className: "yody-table-discount text-right",
    render: (l: OrderLineItemResponse, item: any, index: number) => {
      return (
        <div>
          {l.discount_items.length > 0 && l.discount_items[0].value !== null
            ? formatCurrency(l.discount_items[0].value)
            : 0}
        </div>
      );
    },
  };

  const TotalPriceColumn = {
    title: () => (
      <div>
        <span style={{ color: "#222222" }}>Tổng tiền</span>
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
    ProductColumn,
    AmountColumnt,
    PriceColumnt,
    DiscountColumnt,
    TotalPriceColumn,
  ];
  //#endregion

  return (
    <Card
      className="margin-top-20"
      title={
        <div className="d-flex">
          <span className="title-card">SẢN PHẨM</span>
        </div>
      }
      extra={
        <Row>
          <Space>
            <div className="view-inventory-box">
              <Button type="link" className="p-0" style={{ color: "#000000" }}>
                <Space>
                  <img src={storeBluecon} alt="" />
                  <Link
                    target="_blank"
                    to={`${UrlConfig.STORE}/${OrderDetail?.store_id}`}
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
            locale={{
              emptyText: (
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
              ),
            }}
            rowKey={(record) => record.id}
            columns={columns}
            dataSource={props.OrderDetail?.items.filter(
              (item) => item.type === Type.NORMAL
            )}
            className="sale-product-box-table2 w-100"
            tableLayout="fixed"
            pagination={false}
            footer={() =>
              props.OrderDetail && props.OrderDetail?.items.length > 0 ? (
                <div className="row-footer-custom">
                  <div
                    className="yody-foot-total-text"
                    style={{
                      width: "40%",
                      float: "left",
                      fontWeight: 700,
                      padding: "0 16px",
                    }}
                  >
                    TỔNG
                  </div>
                  <div
                    style={{
                      width: "15%",
                      float: "left",
                      textAlign: "center",
                      fontWeight: 400,
                    }}
                  >
                    {props.OrderDetail?.items &&
                      getTotalQuantity(props.OrderDetail?.items)}
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
                      props.OrderDetail?.items.reduce((a, b) => a + b.amount, 0)
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
                      props.OrderDetail?.items.reduce(
                        (a, b) => a + (b.amount - b.line_amount_after_line_discount),
                        0
                      )
                    )}
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
                      props.OrderDetail?.items.reduce(
                        (a, b) => a + b.line_amount_after_line_discount,
                        0
                      )
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
              <div className="font-weight-500">Tổng tiền</div>
              <div className="font-weight-500">
                {props.OrderDetail?.total_line_amount_after_line_discount !== undefined &&
                  props.OrderDetail?.total_line_amount_after_line_discount !== null &&
                  formatCurrency(
                    props.OrderDetail?.total_line_amount_after_line_discount
                  )}
              </div>
            </Row>

            <Row className="payment-row" justify="space-between" align="middle">
              <Space align="center">
                Chiết khấu:
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
                      {props.OrderDetail?.discounts[0].rate ? Math.round(props.OrderDetail?.discounts[0].rate*100)/100 : 0} %
                    </Tag>
                  </div>
                )}
              </Space>
              <div className="font-weight-400 ">
                {props.OrderDetail?.discounts &&
                props.OrderDetail?.discounts.length > 0 &&
                props.OrderDetail?.discounts[0].amount !== null
                  ? formatCurrency(props.OrderDetail?.discounts[0].amount)
                  : 0}
              </div>
            </Row>
            <Row className="payment-row" justify="space-between" align="middle">
              <Space align="center">Mã giảm giá:</Space>
              <div className="font-weight-500 " style={{color: dangerColor}}>{OrderDetail?.discounts && OrderDetail?.discounts[0]?.discount_code ? handleDisplayCoupon(OrderDetail?.discounts[0]?.discount_code) : "-"}</div>
            </Row>

            <Row className="payment-row padding-top-10" justify="space-between">
              <div className="font-weight-500">Phí ship báo khách:</div>
              <div className="font-weight-500 payment-row-money">
                {(props.OrderDetail &&
                  props.OrderDetail?.fulfillments &&
                  props.OrderDetail?.fulfillments.length > 0 &&
                  props.OrderDetail?.fulfillments[0].shipment &&
                  props.OrderDetail?.fulfillments[0].shipment
                    .shipping_fee_informed_to_customer &&
                  formatCurrency(
                    props.OrderDetail?.fulfillments[0].shipment
                      .shipping_fee_informed_to_customer
                  )) ||
                  (props.shippingFeeInformedCustomer &&
                    formatCurrency(props.shippingFeeInformedCustomer)) ||
                  (props.OrderDetail?.shipping_fee_informed_to_customer &&
                    formatCurrency(
                      props.OrderDetail?.shipping_fee_informed_to_customer
                    )) ||
                  0}
              </div>
            </Row>
            <Divider className="margin-top-5 margin-bottom-5" />
            <Row className="payment-row" justify="space-between">
              <strong className="font-size-text">
                {totalAmountReturnProducts ? "Tổng tiền hàng mua:" : "Khách cần trả:"}
              </strong>
              <strong>{formatCurrency(customerNeedToPayValue)}</strong>
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
                  <strong className="font-size-text" style={{ fontWeight: "bold" }}>
                    {customerNeedToPayValue - totalAmountReturnProducts < 0
                      ? "Cần trả khách:"
                      : "Khách cần trả:"}
                  </strong>
                  <strong className="text-success font-size-price">
                    {formatCurrency(
                      Math.abs(customerNeedToPayValue - totalAmountReturnProducts)
                    )}
                  </strong>
                </Row>
              </React.Fragment>
            ) : null}
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default UpdateProductCard;
