import { Card, Col, Popover, Row, Table } from "antd";
import { ColumnType } from "antd/lib/table";
import emptyProduct from "assets/icon/empty_products.svg";
import { OrderLineItemRequest } from "model/request/order.request";
import {
  OrderLineItemResponse,
  ReturnProductModel,
} from "model/response/order/order.response";
import React, { useCallback } from "react";
import { formatCurrency, getTotalQuantity } from "utils/AppUtils";
import { StyledComponent } from "./styles";

type PropType = {
  listReturnProducts: OrderLineItemResponse[];
  discountRate?: number;
  pointUsing?: number;
  setTotalAmountReturnProducts: (value: number) => void;
};

function CardShowReturnProducts(props: PropType) {
  const {
    listReturnProducts,
    discountRate,
    setTotalAmountReturnProducts,
    pointUsing,
  } = props;

  const getProductDiscountPerOrder = useCallback(
    (product: OrderLineItemResponse) => {
      let discountPerOrder = 0;
      let discountPerProduct = getProductDiscountPerProduct(product);
      if (discountRate) {
        discountPerOrder =
          ((product.price - discountPerProduct) * discountRate) / 100;
      }
      return discountPerOrder;
    },
    [discountRate]
  );

  const getTotalPrice = useCallback(
    (listReturnProducts: OrderLineItemResponse[]) => {
      let totalPrice = 0;
      listReturnProducts.forEach((single) => {
        let discountPerProduct = getProductDiscountPerProduct(single);
        let discountPerOrder = getProductDiscountPerOrder(single);
        let singleTotalPrice =
          single.price - discountPerProduct - discountPerOrder;
        totalPrice = totalPrice + single.quantity * singleTotalPrice;
      });
      setTotalAmountReturnProducts(totalPrice);
      return totalPrice;
    },
    [getProductDiscountPerOrder, setTotalAmountReturnProducts]
  );

  const getProductDiscountPerProduct = (product: OrderLineItemResponse) => {
    let discountPerProduct = 0;
    product.discount_items.forEach((single) => {
      discountPerProduct += single.value;
    });
    return discountPerProduct;
  };

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
            {formatCurrency(Math.round(discountPerProduct))}
          </p>
        </div>
        <div
          className="single"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <p>Chiết khấu/đơn hàng: </p>
          <p style={{ marginLeft: 20 }}>
            {formatCurrency(Math.round(discountPerOrder))}
          </p>
        </div>
      </div>
    );
  };

  const columns: ColumnType<any>[] = [
    {
      title: "Sản phẩm",
      dataIndex: "variant",
      key: "variant",
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
          <span
            style={{ color: "#808080", marginLeft: "6px", fontWeight: 400 }}
          >
            ₫
          </span>
        </div>
      ),
      dataIndex: "price",
      key: "price",
      render: (value: number, record: ReturnProductModel, index: number) => {
        let discountPerProduct = getProductDiscountPerProduct(record);
        let discountPerOrder = getProductDiscountPerOrder(record);
        return (
          <Popover
            content={renderPopOverPriceContent(
              discountPerProduct,
              discountPerOrder
            )}
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
          <span
            style={{ color: "#808080", marginLeft: "6px", fontWeight: 400 }}
          >
            ₫
          </span>
        </div>
      ),
      key: "total",
      render: (
        value: OrderLineItemRequest,
        record: ReturnProductModel,
        index: number
      ) => {
        let discountPerProduct = getProductDiscountPerProduct(record);
        let discountPerOrder = getProductDiscountPerOrder(record);
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
      <Card
        className="margin-top-20"
        title={<span className="title-card">THÔNG TIN SẢN PHẨM TRẢ</span>}
      >
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
            <Row className="payment-row" justify="space-between">
              <span className="font-size-text">Tiêu điểm: </span>
              {`${pointUsing ? pointUsing : 0} điểm`}
            </Row>
            <Row className="payment-row" justify="space-between">
              <strong className="font-size-text">Tổng tiền trả khách:</strong>
              <strong>
                {formatCurrency(Math.round(getTotalPrice(listReturnProducts)))}
              </strong>
            </Row>
          </Col>
        </Row>
      </Card>
    </StyledComponent>
  );
}

export default CardShowReturnProducts;
