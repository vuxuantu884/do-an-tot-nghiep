import { SearchOutlined } from "@ant-design/icons";
import {
  AutoComplete,
  Button,
  Card,
  Checkbox,
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
import { VariantSearchQuery } from "model/product/product.model";
import { OrderLineItemRequest } from "model/request/order.request";
import { OrderLineItemResponse } from "model/response/order/order.response";
import React, { createRef, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { formatCurrency, getTotalQuantity } from "utils/AppUtils";
import { StyledComponent } from "./styles";

type PropType = {
  listOrderProducts: OrderLineItemResponse[];
  listReturnProducts: OrderLineItemResponse[];
  handleReturnProducts: (listReturnProducts: OrderLineItemResponse[]) => void;
};
function CardReturnProducts(props: PropType) {
  const { listReturnProducts, handleReturnProducts, listOrderProducts } = props;
  console.log("listOrderProducts", listOrderProducts);
  const dispatch = useDispatch();
  const initQueryVariant: VariantSearchQuery = {
    limit: 10,
    page: 1,
  };
  const [searchVariantInputValue, setSearchVariantInputValue] = useState("");
  const autoCompleteRef = createRef<RefSelectProps>();

  const onSelectSearchedVariant = (value: string) => {
    console.log("value", value);
    const selectedVariant = listOrderProducts.find((single) => {
      return single.id === +value;
    });
    if (!selectedVariant) return;
    console.log("selectedVariant", selectedVariant);
    let indexSelectedVariant = listReturnProducts.findIndex((single) => {
      return single.id === selectedVariant.id;
    });
    let resultListReturnProducts = [...listReturnProducts];
    console.log("indexSelectedVariant", indexSelectedVariant);
    if (indexSelectedVariant === -1) {
      selectedVariant.quantity = 1;
      resultListReturnProducts = [selectedVariant, ...listReturnProducts];
    } else {
      resultListReturnProducts[indexSelectedVariant].quantity += 1;
    }
    console.log("resultListReturnProducts", resultListReturnProducts);
    handleReturnProducts(resultListReturnProducts);
  };

  const renderSearchVariant = (item: OrderLineItemResponse) => {
    let avatar = item.variant_image;
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
              {item.product}
            </span>
            <span style={{ color: "#95A1AC" }} className="text p-4">
              {item.sku}
            </span>
          </div>
        </div>
        <div className="rs-right">
          <span style={{ color: "#222222" }} className="text t-right">
            {item.price}
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
        </div>
      </div>
    );
  };

  const convertResultSearchVariant = useMemo(() => {
    let options: any[] = [];
    listOrderProducts.forEach((item: OrderLineItemResponse, index: number) => {
      options.push({
        label: renderSearchVariant(item),
        value: item.id ? item.id.toString() : "",
      });
    });
    return options;
  }, [listOrderProducts]);

  const renderCardExtra = () => {
    return (
      <React.Fragment>
        <Checkbox style={{ marginLeft: 20 }} />
        Trả toàn bộ sản phẩm
      </React.Fragment>
    );
  };

  const onChangeProductSearchValue = (value: string) => {
    setSearchVariantInputValue(value);
    initQueryVariant.info = value;
  };

  const onChangeProductQuantity = (value: number, index: number) => {
    let resultListReturnProducts = [...listReturnProducts];
    resultListReturnProducts[index].quantity = Number(
      value == null ? "0" : value.toString().replace(".", "")
    );
    handleReturnProducts(resultListReturnProducts);
    return value;
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
          <div style={{ textAlign: "center" }}>Số lượng trả</div>
          {listReturnProducts && getTotalQuantity(listReturnProducts) > 0 && (
            <span style={{ color: "#2A2A86" }}>
              ({getTotalQuantity(listReturnProducts)})
            </span>
          )}
        </div>
      ),
      dataIndex: "value",
      key: "value",
      width: "40%",
      render: (value, row: OrderLineItemRequest, index: number) => {
        console.log("row", row);
        return (
          <div>
            <InputNumber
              min={1}
              max={10}
              value={row.quantity}
              defaultValue={1}
              onChange={(value: number) =>
                onChangeProductQuantity(value, index)
              }
            />
            / 1
          </div>
        );
      },
    },
    {
      title: "Giá hàng trả",
      dataIndex: "price",
      key: "price",
      width: "20%",
    },
    {
      title: "Thành tiền",
      key: "total",
      width: "40%",
      render: (value: OrderLineItemRequest, item: any, index: number) => {
        return (
          <div className="yody-pos-varian-name">
            {formatCurrency(Math.round(value.line_amount_after_line_discount))}
          </div>
        );
      },
    },
  ];

  return (
    <StyledComponent>
      <Card
        className="margin-top-20"
        title="Sản phẩm"
        extra={renderCardExtra()}
      >
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
          dataSource={listReturnProducts}
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
                4
              </div>
            </Row>
            <Row style={{ justifyContent: "space-between" }}>
              <div className="font-weight-500">Phí ship báo khách:</div>
              <div className="font-weight-500" style={{ fontWeight: 500 }}>
                20.000
              </div>
            </Row>
            <Row style={{ justifyContent: "space-between" }}>
              <div className="font-weight-500">Tổng tiền:</div>
              <div className="font-weight-500" style={{ fontWeight: 500 }}>
                270.000
              </div>
            </Row>
            <Divider className="margin-top-5 margin-bottom-5" />
            <Row className="payment-row" justify="space-between">
              <strong className="font-size-text">Khách cần phải trả:</strong>
              <strong className="text-success font-size-price">166.000</strong>
            </Row>
          </Col>
        </Row>
      </Card>
    </StyledComponent>
  );
}

export default CardReturnProducts;
