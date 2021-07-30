//#region Import
import {
  Button,
  Card,
  Row,
  Col,
  Space,
  Typography,
  Divider,
  Checkbox,
  Tooltip,
  Table,
  Tag,
} from "antd";
import giftIcon from "assets/icon/gift.svg";
import storeBluecon from "assets/img/storeBlue.svg";
import {
  OrderLineItemResponse,
  OrderResponse,
} from "model/response/order/order.response";
import { formatCurrency, getTotalQuantity } from "utils/AppUtils";
//#endregion

type ProductCardUpdateProps = {
  shippingFeeInformedCustomer: number | null;
  OrderDetail: OrderResponse | null;
  customerNeedToPayValue: any 
};

const UpdateProductCard: React.FC<ProductCardUpdateProps> = (
  props: ProductCardUpdateProps
) => {

  const ProductColumn = {
    title: () => (
      <div className="text-center">
        <div>Sản phẩm</div>
        <span style={{ color: "#0080FF" }}></span>
      </div>
    ),
    width: "35%",
    className: "yody-pos-name",
    render: (l: OrderLineItemResponse, item: any, index: number) => {
      return (
        <div className="w-100" style={{ overflow: "hidden" }}>
          <div className="d-flex align-items-center">
            <div style={{ width: "calc(100% - 32px)", marginLeft: "15px" }}>
              <div className="yody-pos-sku">
                <Typography.Link>{l.sku}</Typography.Link>
              </div>
              <div className="yody-pos-varian">
                <Tooltip title={l.variant} className="yody-pos-varian-name">
                  <span>{l.variant}</span>
                </Tooltip>
              </div>
            </div>
          </div>
          {l.gifts?.map((a, index1) => (
            <div key={index1} className="yody-pos-addition yody-pos-gift">
              <div>
                <img src={giftIcon} alt="" /> {a.variant}{" "}
                <span>({a.quantity})</span>
              </div>
            </div>
          ))}
        </div>
      );
    },
  };

  const AmountColumnt = {
    title: () => (
      <div className="text-center">
        <div>Số lượng</div>
        <span style={{ color: "#0080FF" }}>
          (
          {props.OrderDetail?.items !== undefined &&
            getTotalQuantity(props.OrderDetail?.items)}
          )
        </span>
      </div>
    ),
    className: "yody-pos-quantity text-center",
    width: "15%",
    render: (l: OrderLineItemResponse, item: any, index: number) => {
      return <div className="yody-pos-qtt">{l.quantity}</div>;
    },
  };

  const PriceColumnt = {
    title: "Đơn giá",
    className: "yody-pos-price text-right",
    width: "15%",
    align: "right",
    render: (l: OrderLineItemResponse, item: any, index: number) => {
      return <div className="yody-pos-price">{formatCurrency(l.price)}</div>;
    },
  };

  const DiscountColumnt = {
    title: "Chiết khấu",
    align: "center",
    width: "20%",
    className: "yody-table-discount text-right",
    render: (l: OrderLineItemResponse, item: any, index: number) => {
      return (
        <div>
          {l.discount_items[0].value !== null
            ? formatCurrency(l.discount_items[0].value)
            : 0}
        </div>
      );
    },
  };

  const TotalPriceColumn = {
    title: "Tổng tiền",
    width: "20%",
    className: "yody-table-total-money text-right",
    render: (l: OrderLineItemResponse, item: any, index: number) => {
      return (
        <div style={{ textAlign: "left" }}>
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
              <Button type="link" className="p-0" style={{ color: "#0080ff" }}>
                <Space>
                  <img src={storeBluecon} alt="" />
                  YODY Kho Online
                </Space>
              </Button>
            </div>
          </Space>
        </Row>
      }
    >
      <div style={{ padding: "10px 0 24px 0" }}>
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
            dataSource={props.OrderDetail?.items}
            className="sale-product-box-table w-100"
            tableLayout="fixed"
            pagination={false}
          />
        </Row>

        <Row
          className="sale-product-box-payment padding-24"
          gutter={24}
          style={{ paddingTop: "30px" }}
        >
          <Col xs={24} lg={12}>
            <div className="payment-row">
              <Checkbox className="margin-bottom-15">
                Bỏ chiết khấu tự động
              </Checkbox>
            </div>
            <div className="payment-row">
              <Checkbox className="margin-bottom-15">
                Không tính thuế VAT
              </Checkbox>
            </div>
            <div className="payment-row">
              <Checkbox className="margin-bottom-15">
                Bỏ tích điểm tự động
              </Checkbox>
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <Row className="payment-row" justify="space-between">
              <strong className="font-size-text">Tổng tiền</strong>
              <strong className="font-size-text">
                {props.OrderDetail?.total_line_amount_after_line_discount !==
                  undefined &&
                  props.OrderDetail?.total_line_amount_after_line_discount !== null &&
                  formatCurrency(
                    props.OrderDetail?.total_line_amount_after_line_discount
                  )}
              </strong>
            </Row>

            <Row
              className="payment-row"
              justify="space-between"
              align="middle"
              style={{ marginTop: "5px" }}
            >
              <Space align="center">
                <Typography.Link
                  className="font-weight-500"
                  style={{
                    borderBottom: "1px solid #5D5D8A",
                    color: "#5D5D8A",
                  }}
                >
                  Chiết khấu
                </Typography.Link>
                {props.OrderDetail?.discounts !== undefined &&
                  props.OrderDetail?.discounts !== null &&
                  props.OrderDetail?.discounts.length > 0 && (
                    <div>
                      <Tag
                        style={{
                          marginTop: 0,
                          color: "#E24343",
                          backgroundColor: "#F5F5F5",
                        }}
                        className="orders-tag orders-tag-danger"
                      >
                        {props.OrderDetail?.discounts[0].rate} %
                      </Tag>
                    </div>
                  )}
              </Space>
              <div className="font-weight-500 ">
                {props.OrderDetail?.discounts !== undefined &&
                props.OrderDetail?.discounts !== null &&
                props.OrderDetail?.discounts.length > 0 &&
                props.OrderDetail?.discounts[0].amount !== null
                  ? formatCurrency(props.OrderDetail?.discounts[0].amount)
                  : 0}
              </div>
            </Row>
            <Row
              className="payment-row"
              justify="space-between"
              align="middle"
              style={{ marginTop: "5px" }}
            >
              <Space align="center">
                <Typography.Link
                  className="font-weight-500"
                  style={{
                    borderBottom: "1px solid #5D5D8A",
                    color: "#5D5D8A",
                  }}
                >
                  Mã giảm giá
                </Typography.Link>
              </Space>
              <div className="font-weight-500 ">0</div>
            </Row>

            <Row className="payment-row padding-top-10" justify="space-between">
              <div className="font-weight-500">Phí ship báo khách</div>
              <div className="font-weight-500 payment-row-money">
                {(props.OrderDetail &&
                  props.OrderDetail?.fulfillments &&
                  props.OrderDetail?.fulfillments.length > 0 &&
                  props.OrderDetail?.fulfillments[0].shipment &&
                  props.OrderDetail?.fulfillments[0].shipment.shipping_fee_informed_to_customer &&
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
              <strong className="font-size-text">Khách cần trả</strong>
              <strong className="text-success font-size-text">
                {formatCurrency(props.customerNeedToPayValue)}
              </strong>
            </Row>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default UpdateProductCard;
