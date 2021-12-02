import { SearchOutlined } from "@ant-design/icons";
import {
  AutoComplete,
  Button,
  Card,
  Checkbox,
  Col,
  Input,
  Popover,
  Row,
  Table,
} from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { RefSelectProps } from "antd/lib/select";
import { ColumnType } from "antd/lib/table";
import emptyProduct from "assets/icon/empty_products.svg";
import NumberInput from "component/custom/number-input.custom";
import { OrderLineItemRequest } from "model/request/order.request";
import {
  OrderLineItemResponse,
  OrderResponse,
  ReturnProductModel,
} from "model/response/order/order.response";
import React, { createRef, useCallback, useMemo } from "react";
import { formatCurrency, getTotalQuantity } from "utils/AppUtils";
import { StyledComponent } from "./styles";

type PropType = {
  OrderDetail: OrderResponse | null;
  listOrderProducts?: OrderLineItemResponse[];
  listReturnProducts: ReturnProductModel[];
  handleCanReturn?: (value: boolean) => void;
  isDetailPage?: boolean;
  isExchange?: boolean;
  isStepExchange?: boolean;
  isShowProductSearch?: boolean;
  searchVariantInputValue: string;
  totalPrice: number;
  isCheckReturnAll: boolean;
  convertResultSearchVariant: any[] | undefined;
  onChangeProductSearchValue: (value: string) => void;
  onSelectSearchedVariant: (value: string) => void;
  onChangeProductQuantity: (value: number | null, index: number) => void;
  handleChangeReturnAll: (e: CheckboxChangeEvent) => void;
};

function CardReturnProducts(props: PropType) {
  const {
    OrderDetail,
    listReturnProducts,
    isDetailPage = false,
    isExchange = false,
    isStepExchange,
    isShowProductSearch = false,
    searchVariantInputValue,
    convertResultSearchVariant,
    totalPrice,
    isCheckReturnAll,
    onChangeProductSearchValue,
    onSelectSearchedVariant,
    onChangeProductQuantity,
    handleChangeReturnAll,
  } = props;

  const autoCompleteRef = createRef<RefSelectProps>();

  const pointRate = 1000;
  const pointPaymentMethod = "Tiêu điểm";

  const discountRate = useMemo(() => {
    if (OrderDetail && OrderDetail.discounts) {
      let discountRate = 0;
      OrderDetail.discounts.forEach((single) => {
        const singleDiscountRate = single.rate || 0;
        discountRate += singleDiscountRate;
      });
      return discountRate;
    } else {
      return 0;
    }
  }, [OrderDetail]);

  const pointUsing = useMemo(() => {
    let html = null;
    let paymentPointArray = OrderDetail?.payments?.filter((single) => {
      return single.payment_method === pointPaymentMethod;
    });
    if (paymentPointArray) {
      console.log("paymentPointArray", paymentPointArray);
      let amountPoint = 0;
      paymentPointArray.forEach((single) => {
        amountPoint += single.paid_amount;
        console.log("result", amountPoint);
        html = <span>{amountPoint / pointRate}</span>;
      });
    } else {
      html = "-";
    }
    return html;
  }, [OrderDetail]);

  const renderCardExtra = () => {
    return (
      <React.Fragment>
        <Checkbox
          style={{ marginLeft: 20 }}
          onChange={handleChangeReturnAll}
          checked={isCheckReturnAll}
        >
          Trả toàn bộ sản phẩm
        </Checkbox>
      </React.Fragment>
    );
  };

  const getProductDiscountPerProduct = (product: ReturnProductModel) => {
    let discountPerProduct = 0;
    product.discount_items.forEach((single) => {
      discountPerProduct += single.value;
    });
    return discountPerProduct;
  };

  const getProductDiscountPerOrder = useCallback(
    (product: ReturnProductModel) => {
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
        if (isDetailPage) {
          return record.quantity;
        } else {
          if (isExchange && isStepExchange) {
            return record.quantity;
          }
          return (
            <div>
              <NumberInput
                min={0}
                max={record.maxQuantityCanBeReturned}
                value={record.quantity}
                // defaultValue={0}
                onChange={(value: number | null) =>
                  onChangeProductQuantity(value, index)
                }
                className="hide-number-handle"
                maxLength={4}
                minLength={0}
                style={{ width: 100 }}
              />{" "}
              / {record.maxQuantityCanBeReturned}
            </div>
          );
        }
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
        title={isStepExchange ? "Thông tin sản phẩm trả" : "SẢN PHẨM"}
        extra={!isDetailPage && !isStepExchange ? renderCardExtra() : null}
      >
        {isShowProductSearch && (
          <div>
            <div className="label">Sản phẩm:</div>
            <AutoComplete
              notFoundContent={
                searchVariantInputValue.length >= 0
                  ? "Không tìm thấy sản phẩm"
                  : undefined
              }
              id="search_product"
              value={searchVariantInputValue}
              ref={autoCompleteRef}
              onSelect={onSelectSearchedVariant}
              dropdownClassName="search-layout dropdown-search-header"
              dropdownMatchSelectWidth={456}
              className="productSearchInput"
              onSearch={onChangeProductSearchValue}
              options={convertResultSearchVariant}
              maxLength={255}
              dropdownRender={(menu) => <div>{menu}</div>}
            >
              <Input
                size="middle"
                className="yody-search"
                placeholder="Chọn sản phẩm"
                prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
              />
            </AutoComplete>
          </div>
        )}
        <Table
          locale={{
            emptyText: (
              <div className="sale_order_empty_product">
                <img src={emptyProduct} alt="empty product"></img>
                <p>Chưa có sản phẩm đổi trả!</p>
                <Button
                  type="text"
                  className="font-weight-500"
                  style={{
                    background: "rgba(42,42,134,0.05)",
                  }}
                  onClick={() => {
                    autoCompleteRef.current?.focus();
                  }}
                >
                  Thêm sản phẩm ngay (F3)
                </Button>
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
              <span className="font-size-text">Điểm đã tiêu: </span>
              <span>{pointUsing}</span>
            </Row>
            <Row className="payment-row" justify="space-between">
              <strong className="font-size-text">Tổng tiền trả khách 2:</strong>
              <strong>{formatCurrency(totalPrice)}</strong>
            </Row>
          </Col>
        </Row>
      </Card>
    </StyledComponent>
  );
}

export default CardReturnProducts;
