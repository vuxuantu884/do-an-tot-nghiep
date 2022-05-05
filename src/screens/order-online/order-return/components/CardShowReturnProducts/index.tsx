import { Card, Col, Popover, Row, Table, Tooltip, Typography } from "antd";
import { ColumnType } from "antd/lib/table";
import emptyProduct from "assets/icon/empty_products.svg";
import UrlConfig from "config/url.config";
import { OrderLineItemRequest } from "model/request/order.request";
import {
  OrderLineItemResponse,
  OrderResponse,
  ReturnProductModel
} from "model/response/order/order.response";
import React from "react";
import { Link } from "react-router-dom";
import { formatCurrency, getProductDiscountPerOrder, getProductDiscountPerProduct, getTotalQuantity } from "utils/AppUtils";
import { StyledComponent } from "./styles";

type PropTypes = {
  listReturnProducts: OrderLineItemResponse[];
  pointUsing?: number;
  totalAmountReturnToCustomer: number | undefined;
  isDetailPage?: boolean;
	OrderDetail?: OrderResponse | null;
};

function CardShowReturnProducts(props: PropTypes) {
  const {
    listReturnProducts,
		OrderDetail,
    pointUsing,
    totalAmountReturnToCustomer,
    isDetailPage = false,
  } = props;

  const renderPopOverPriceTitle = (price: number) => {
    return (
      <div>
        <div
          className="single"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <p style={{ margin: 0 }}>Đơn giá gốc: </p>
          <p style={{ margin: "0 0 0 20px" }}>{formatCurrency(price)}</p>
        </div>
      </div>
    );
  };

  const renderPopOverPriceContent = (
    discountPerProduct: number,
    discountPerOrder: number
  ) => {
    return (
      <div>
        <div
          className="single"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <p>Chiết khấu/sản phẩm: </p>
          <p style={{ marginLeft: 20 }}>
            {formatCurrency(discountPerProduct)}
          </p>
        </div>
        <div
          className="single"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <p>Chiết khấu/đơn hàng: </p>
          <p style={{ marginLeft: 20 }}>{formatCurrency(discountPerOrder)}</p>
        </div>
      </div>
    );
  };

  const columns: ColumnType<any>[] = [
    {
      title: "Sản phẩm",
      dataIndex: "variant",
      key: "variant",
      width: "30%",
      render: (value, record: ReturnProductModel, index: number) => {
        return (
          <div className="d-flex align-items-center">
            <div
              style={{
                width: "calc(100% - 32px)",
                float: "left",
              }}
            >
              <div className="yody-pos-sku">
                <Link
                  target="_blank"
                  to={`${UrlConfig.PRODUCT}/${record.product_id}/variants/${record.variant_id}`}
                >
                  {record.sku}
                </Link>
              </div>
              <div className="yody-pos-varian">
                <Tooltip title={record.variant} className="yody-pos-varian-name">
                  <span>{record.variant}</span>
                </Tooltip>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: () => (
        <div className="text-center">
          <div style={{ textAlign: "center" }}>Số lượng trả</div>
        </div>
      ),
      align:"center",
      className: "columnQuantity",
      render: (value, record: ReturnProductModel, index: number) => {
        return record.quantity;
      },
    },
   
    {
      title: () => (
        <div>
          <span style={{ color: "#222222" }}>Chiết khấu/sản phẩm</span>
          {/* <span style={{ color: "#808080", marginLeft: "6px", fontWeight: 400 }}>₫</span> */}
        </div>
      ),
      align: "center",
      // width:"150px",
      width: "17%",
      className: "yody-table-discount text-right 32",
      render: (
        value: OrderLineItemRequest,
        record: ReturnProductModel,
        index: number
      ) => {
       
        return (
          <div>
          {value.discount_items.length > 0 && value.discount_items[0].value !== null
            ? formatCurrency(value.discount_items[0].value)
            : 0}
            {value.discount_items[0]?.rate ? (
              <div className="d-flex justify-content-end yody-table-discount-converted">
                <Typography.Text type="danger">
                  <span style={{fontSize: "0.857rem"}}>
                    {Math.round(value.discount_items[0]?.rate * 100 || 0)/100}%
                  </span>
                </Typography.Text>
              </div>
            ) : null}
        </div>
        );
      },
    },
    {
      title: () => (
        <div>
          <span style={{ color: "#222222" }}>Chiết khấu/đơn hàng</span>
          <span style={{ color: "#808080", marginLeft: "6px", fontWeight: 400 }}>₫</span>
        </div>
      ),
      align: "center",
      width: "15%",
      key: "total",
      render: (
        value: OrderLineItemRequest,
        record: ReturnProductModel,
        index: number
      ) => {
        let discountPerOrder = OrderDetail?.order_return_origin ? getProductDiscountPerOrder(OrderDetail?.order_return_origin, record) : getProductDiscountPerOrder(OrderDetail, record);
        return (
          
          <div>
            {formatCurrency(discountPerOrder)}
            {/* {value.discount_items[0]?.rate ? (
              <div className="d-flex justify-content-end yody-table-discount-converted">
                <Typography.Text type="danger">
                  <span style={{fontSize: "0.857rem"}}>
                    {Math.round(value.discount_items[0]?.rate * 100 || 0)/100}%
                  </span>
                </Typography.Text>
              </div>
            ) : null} */}
          </div>
        );
      },
    },
    {
      title: () => (
        <div>
          <span style={{ color: "#222222", textAlign: "right" }}>
            Đơn giá sau giảm giá
          </span>
          <span style={{ color: "#808080", marginLeft: "6px", fontWeight: 400 }}>₫</span>
        </div>
      ),
      dataIndex: "price",
      align:"center",
      key: "price",
      width: "15%",
      render: (value: number, record: ReturnProductModel, index: number) => {
        let discountPerProduct = getProductDiscountPerProduct(record);
				// nếu là page đổi trả hàng thì có order_return_origin
        let discountPerOrder = OrderDetail?.order_return_origin ? getProductDiscountPerOrder(OrderDetail?.order_return_origin, record) : getProductDiscountPerOrder(OrderDetail, record);
        return (
          <Popover
            content={renderPopOverPriceContent(discountPerProduct, discountPerOrder)}
            title={renderPopOverPriceTitle(record.price)}
          >
            {formatCurrency(
              Math.ceil(record.price - discountPerProduct - discountPerOrder)
            )}
          </Popover>
        );
      },
    },
    {
      title: () => (
        <div>
          <span style={{ color: "#222222" }}>Tổng tiền</span>
          <span style={{ color: "#808080", marginLeft: "6px", fontWeight: 400 }}>₫</span>
        </div>
      ),
      align: "right",
      key: "total",
      render: (
        value: OrderLineItemRequest,
        record: ReturnProductModel,
        index: number
      ) => {
        let discountPerProduct = getProductDiscountPerProduct(record);
				let discountPerOrder = OrderDetail?.order_return_origin ? getProductDiscountPerOrder(OrderDetail?.order_return_origin, record) : getProductDiscountPerOrder(OrderDetail, record);
        return (
          <div className="yody-pos-varian-name">
            {formatCurrency(
              Math.ceil((value.price - discountPerProduct - discountPerOrder) *
                value.quantity
            ))}
          </div>
        );
      },
    },
  ];

  return (
    <StyledComponent>
      <Card title="THÔNG TIN SẢN PHẨM TRẢ">
        <Table
          locale={{
            emptyText: (
              <div className="sale_order_empty_product">
                <img src={emptyProduct} alt="empty product"></img>
                <p>Chưa có sản phẩm đổi trả!</p>
              </div>
            ),
          }}
          rowKey={(record: any) => record.id}
          columns={columns}
          dataSource={listReturnProducts}
          className="w-100"
          tableLayout="fixed"
          pagination={false}
          sticky
        />
        <Row className="boxPayment" gutter={24}>
          <Col xs={24} lg={11}></Col>
          <Col xs={24} lg={10}>
            <Row className="payment-row" justify="space-between">
              <span className="font-size-text">Số lượng:</span>
              <span>
                {listReturnProducts && (
                  <span>{getTotalQuantity(listReturnProducts)}</span>
                )}
              </span>
            </Row>
            {isDetailPage ? (
              <React.Fragment>
                {/* <Row className="payment-row" justify="space-between">
                  <span className="font-size-text">Điểm trừ: </span>
                  {`${pointReturnToCustomer ? pointReturnToCustomer : 0} điểm`}
                </Row> */}
                <Row className="payment-row" justify="space-between">
                  {/* <span className="font-size-text">Điểm hoàn: </span> */}
                  <span className="font-size-text">Điểm hoàn: </span>
                  {`${pointUsing ? pointUsing : 0} điểm`}
                </Row>
              </React.Fragment>
            ) : (
              <Row className="payment-row" justify="space-between">
                <span className="font-size-text">Tiêu điểm: </span>
                {`${pointUsing ? pointUsing : 0} điểm`}
              </Row>
            )}
            <Row className="payment-row" justify="space-between">
              <strong className="font-size-text">Tổng tiền trả khách:</strong>
              <strong>
                {totalAmountReturnToCustomer
                  ? formatCurrency(Math.ceil(totalAmountReturnToCustomer))
                  : 0}
              </strong>
            </Row>
          </Col>
        </Row>
      </Card>
    </StyledComponent>
  );
}

export default CardShowReturnProducts;
