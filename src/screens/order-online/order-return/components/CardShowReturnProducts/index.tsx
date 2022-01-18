import { Card, Col, Popover, Row, Table, Tooltip } from "antd";
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

type PropType = {
  listReturnProducts: OrderLineItemResponse[];
  pointUsing?: number;
  totalAmountReturnToCustomer: number | undefined;
  isDetailPage?: boolean;
	OrderDetail?: OrderResponse | null;
};

function CardShowReturnProducts(props: PropType) {
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
          <p style={{ margin: "0 0 0 20px" }}>{price}</p>
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
      className: "columnQuantity",
      render: (value, record: ReturnProductModel, index: number) => {
        return record.quantity;
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
      key: "price",
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
              Math.round(record.price - discountPerProduct - discountPerOrder)
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
              Math.round(value.price - discountPerProduct - discountPerOrder) *
                value.quantity
            )}
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
          scroll={{ y: 300 }}
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
                  ? formatCurrency(totalAmountReturnToCustomer)
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
