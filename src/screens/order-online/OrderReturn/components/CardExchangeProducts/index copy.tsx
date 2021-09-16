import { SearchOutlined } from "@ant-design/icons";
import {
  AutoComplete,
  Button,
  Card,
  Col,
  Divider,
  Input,
  InputNumber,
  Row,
  Table,
} from "antd";
import { RefSelectProps } from "antd/lib/select";
import { ColumnType } from "antd/lib/table";
import emptyProduct from "assets/icon/empty_products.svg";
import imgDefault from "assets/icon/img-default.svg";
import { AppConfig } from "config/app.config";
import { Type } from "config/type.config";
import { searchVariantsOrderRequestAction } from "domain/actions/product/products.action";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderItemDiscountModel } from "model/other/order/order-model";
import {
  VariantResponse,
  VariantSearchQuery,
} from "model/product/product.model";
import { OrderLineItemRequest } from "model/request/order.request";
import {
  OrderLineItemResponse,
  ReturnProductModel,
} from "model/response/order/order.response";
import React, { createRef, useCallback, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import DiscountGroup from "screens/order-online/component/discount-group";
import {
  findAvatar,
  findPrice,
  findPriceInVariant,
  findTaxInVariant,
  formatCurrency,
  getTotalAmount,
  getTotalQuantity,
} from "utils/AppUtils";
import { StyledComponent } from "./styles";

type PropType = {
  listExchangeProducts: Array<OrderLineItemRequest>;
  handleListExchangeProducts: (
    listExchangeProducts: OrderLineItemRequest[]
  ) => void;
};

function CardReturnProducts(props: PropType) {
  const { listExchangeProducts, handleListExchangeProducts } = props;

  console.log("props", props);
  const dispatch = useDispatch();
  const [searchVariantInputValue, setSearchVariantInputValue] = useState("");
  const autoCompleteRef = createRef<RefSelectProps>();
  const initQueryVariant: VariantSearchQuery = {
    limit: 10,
    page: 1,
  };
  const [resultSearchVariant, setResultSearchVariant] = useState<
    PageResponse<VariantResponse>
  >({
    metadata: {
      limit: 0,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [splitLine, setSplitLine] = useState<boolean>(false);

  const createNewDiscountItem = () => {
    const newDiscountItem: OrderItemDiscountModel = {
      amount: 0,
      rate: 0,
      reason: "",
      value: 0,
    };
    return newDiscountItem;
  };

  const createItem = (variant: VariantResponse) => {
    let price = findPriceInVariant(variant.variant_prices, AppConfig.currency);
    let taxRate = findTaxInVariant(variant.variant_prices, AppConfig.currency);
    let avatar = findAvatar(variant.variant_images);
    const discountItem: OrderItemDiscountModel = createNewDiscountItem();
    let orderLine: OrderLineItemRequest = {
      id: new Date().getTime(),
      sku: variant.sku,
      variant_id: variant.id,
      product_id: variant.product.id,
      variant: variant.name,
      variant_barcode: variant.barcode,
      product_type: variant.product.product_type,
      quantity: 1,
      price: price,
      amount: price,
      note: "",
      type: Type.NORMAL,
      variant_image: avatar,
      unit: variant.product.unit,
      weight: variant.weight,
      weight_unit: variant.weight_unit,
      warranty: variant.product.preservation,
      discount_items: [discountItem],
      discount_amount: 0,
      discount_rate: 0,
      composite: variant.composite,
      is_composite: variant.composite,
      discount_value: 0,
      line_amount_after_line_discount: price,
      product: variant.product.name,
      // tax_include: true,
      tax_include: null,
      tax_rate: taxRate,
      show_note: false,
      gifts: [],
      position: undefined,
    };
    return orderLine;
  };

  const onDiscountItem = (_items: Array<OrderLineItemRequest>) => {
    let resultItems = _items.map((single) => {
      let discountAmount = 0;
      single.discount_items.forEach((item) => {
        discountAmount = discountAmount + item.amount;
      });
      single.discount_amount = discountAmount;
      return single;
    });
    handleListExchangeProducts(resultItems);
  };

  const onSelectSearchedVariant = useCallback(
    (v, o) => {
      let newV = parseInt(v);
      let _items = [...listExchangeProducts].reverse();
      let indexSearch = resultSearchVariant.items.findIndex(
        (s) => s.id === newV
      );
      let index = _items.findIndex((i) => i.variant_id === newV);
      let r: VariantResponse = resultSearchVariant.items[indexSearch];
      const item: OrderLineItemRequest = createItem(r);
      item.position = listExchangeProducts.length + 1;
      if (r.id === newV) {
        if (splitLine || index === -1) {
          _items.push(item);
          // setAmount(amount + item.price);
          // calculateChangeMoney(
          //   _items,
          //   amount + item.price,
          //   discountRate,
          //   discountValue
          // );
        } else {
          let variantItems = _items.filter((item) => item.variant_id === newV);
          let lastIndex = variantItems.length - 1;
          variantItems[lastIndex].quantity += 1;
          variantItems[lastIndex].line_amount_after_line_discount +=
            variantItems[lastIndex].price -
            variantItems[lastIndex].discount_items[0].amount;
          // setAmount(
          //   amount +
          //     variantItems[lastIndex].price -
          //     variantItems[lastIndex].discount_items[0].amount
          // );
          // calculateChangeMoney(
          //   _items,
          //   amount +
          //     variantItems[lastIndex].price -
          //     variantItems[lastIndex].discount_items[0].amount,
          //   discountRate,
          //   discountValue
          // );
        }
      }
      handleListExchangeProducts(_items.reverse());
      autoCompleteRef.current?.blur();
      setSearchVariantInputValue("");
    },
    [resultSearchVariant, listExchangeProducts, splitLine]
    // autoCompleteRef, dispatch, resultSearch
  );

  const renderSearchVariant = (item: VariantResponse) => {
    let avatar = findAvatar(item.variant_images);
    return (
      <div
        className="row-search w-100"
        style={{ padding: 0, paddingRight: 20, paddingLeft: 20 }}
      >
        <div className="rs-left w-100" style={{ width: "100%" }}>
          <div style={{ marginTop: 10 }}>
            <img
              src={avatar === "" ? imgDefault : avatar}
              alt="anh"
              placeholder={imgDefault}
              style={{ width: "40px", height: "40px", borderRadius: 5 }}
            />
          </div>
          <div className="rs-info w-100">
            <span style={{ color: "#37394D" }} className="text">
              {item.name}
            </span>
            <span style={{ color: "#95A1AC" }} className="text p-4">
              {item.sku}
            </span>
          </div>
        </div>
        <div className="rs-right">
          <span style={{ color: "#222222" }} className="text t-right">
            {`${findPrice(item.variant_prices, AppConfig.currency)} `}
            <span
              style={{
                color: "#737373",
                textDecoration: "underline",
                textDecorationColor: "#737373",
              }}
            >
              đ
            </span>
          </span>
          <span style={{ color: "#737373" }} className="text t-right p-4">
            Có thể bán:
            <span
              style={{
                color: item.inventory > 0 ? "#2A2A86" : "rgba(226, 67, 67, 1)",
              }}
            >
              {` ${item.inventory}`}
            </span>
          </span>
        </div>
      </div>
    );
  };

  const convertResultSearchVariant = useMemo(() => {
    let options: any[] = [];
    resultSearchVariant.items.forEach(
      (item: VariantResponse, index: number) => {
        options.push({
          label: renderSearchVariant(item),
          value: item.id ? item.id.toString() : "",
        });
      }
    );
    return options;
  }, [resultSearchVariant.items]);

  const onChangeProductSearchValue = (value: string) => {
    setSearchVariantInputValue(value);
    initQueryVariant.info = value;
    dispatch(
      searchVariantsOrderRequestAction(initQueryVariant, setResultSearchVariant)
    );
  };

  const onChangeProductQuantity = (value: number, index: number) => {
    let resultListExchangeProducts = [...listExchangeProducts];
    resultListExchangeProducts[index].quantity = Number(
      value == null ? "0" : value.toString().replace(".", "")
    );
    console.log("resultListExchangeProducts", resultListExchangeProducts);
    handleListExchangeProducts(resultListExchangeProducts);
  };

  const getTotalPrice = (listReturnProducts: ReturnProductModel[]) => {
    let total = 0;
    listReturnProducts.forEach((a) => {
      let singlePrice = a.quantity * (a.price - a.discount_amount);
      total = total + singlePrice;
    });
    return total;
  };

  const columns: ColumnType<any>[] = [
    {
      title: "Sản phẩm",
      dataIndex: "variant",
      key: "variant",
      width: "40%",
    },
    {
      title: () => (
        <div className="text-center">
          <div style={{ textAlign: "center" }}>Số lượng</div>
          {listExchangeProducts &&
            getTotalQuantity(listExchangeProducts) > 0 && (
              <span style={{ color: "#2A2A86" }}>
                ({getTotalQuantity(listExchangeProducts)})
              </span>
            )}
        </div>
      ),
      dataIndex: "value",
      key: "value",
      width: "40%",
      render: (value, row: ReturnProductModel, index: number) => {
        console.log("row", row);
        return (
          <div>
            <InputNumber
              min={1}
              max={row.maxQuantity}
              value={row.quantity}
              defaultValue={1}
              onChange={(value: number) =>
                onChangeProductQuantity(value, index)
              }
            />
          </div>
        );
      },
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: "20%",
      render: (value: number, item: any, index: number) => {
        return <div>{formatCurrency(value)}</div>;
      },
    },
    {
      title: () => (
        <div className="text-center">
          <div>Chiết khấu</div>
        </div>
      ),
      align: "center",
      width: "22%",
      className: "yody-table-discount text-right",
      render: (l: OrderLineItemRequest, item: any, index: number) => {
        return (
          <div className="site-input-group-wrapper saleorder-input-group-wrapper">
            <DiscountGroup
              price={l.price}
              index={index}
              discountRate={l.discount_items[0].rate}
              discountValue={l.discount_items[0].value}
              totalAmount={l.discount_items[0].amount}
              items={listExchangeProducts}
              handleCardItems={onDiscountItem}
            />
          </div>
        );
      },
    },
    {
      title: "Thành tiền",
      key: "total",
      width: "40%",
      render: (value: OrderLineItemRequest, item: any, index: number) => {
        return (
          <div className="yody-pos-varian-name">
            {formatCurrency(
              Math.round(value.price - value.discount_amount) * value.quantity
            )}
          </div>
        );
      },
    },
  ];

  return (
    <StyledComponent>
      <Card className="margin-top-20" title="Thông tin sản phẩm đổi">
        <div className="label">Sản phẩm:</div>
        <AutoComplete
          notFoundContent={
            searchVariantInputValue.length >= 3
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
            placeholder="Tìm sản phẩm mã 7... (F3)"
            prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
          />
        </AutoComplete>
        <Table
          locale={{
            emptyText: (
              <div className="sale_order_empty_product">
                <img src={emptyProduct} alt="empty product"></img>
                <p>Đơn hàng của bạn chưa có sản phẩm nào!</p>
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
          dataSource={listExchangeProducts}
          className="w-100"
          tableLayout="fixed"
          pagination={false}
          scroll={{ y: 300 }}
          sticky
        />
        <Row className="sale-product-box-payment" gutter={24}>
          <Col xs={24} lg={11}></Col>
          <Col xs={24} lg={10}>
            <Row style={{ justifyContent: "space-between" }}>
              <div className="font-weight-500">Số lượng:</div>
              <div className="font-weight-500" style={{ fontWeight: 500 }}>
                {getTotalQuantity(listExchangeProducts)}
              </div>
            </Row>
            <Divider className="margin-top-5 margin-bottom-5" />
            <Row className="payment-row" justify="space-between">
              <strong className="font-size-text">Tổng tiền hàng mua:</strong>
              <strong className="text-success font-size-price">
                {getTotalPrice(listExchangeProducts)}
              </strong>
            </Row>
          </Col>
        </Row>
      </Card>
    </StyledComponent>
  );
}

export default CardReturnProducts;
