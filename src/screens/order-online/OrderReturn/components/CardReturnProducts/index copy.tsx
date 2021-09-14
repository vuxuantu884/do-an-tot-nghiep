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
  Select,
} from "antd";
import { RefSelectProps } from "antd/lib/select";
import { ColumnType } from "antd/lib/table";
import emptyProduct from "assets/icon/empty_products.svg";
import imgDefault from "assets/icon/img-default.svg";
import addIcon from "assets/img/plus_1.svg";
import { AppConfig } from "config/app.config";
import { Type } from "config/type.config";
import { searchVariantsOrderRequestAction } from "domain/actions/product/products.action";
import { PageResponse } from "model/base/base-metadata.response";
import {
  VariantResponse,
  VariantSearchQuery,
} from "model/product/product.model";
import { OrderLineItemRequest } from "model/request/order.request";
import { OrderLineItemResponse } from "model/response/order/order.response";
import React, { createRef, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
  findAvatar,
  findPrice,
  findPriceInVariant,
  findTaxInVariant,
  formatCurrency,
  getTotalQuantity,
} from "utils/AppUtils";
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
  const [splitLine, setSplitLine] = useState<boolean>(false);
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
  const [searchVariantInputValue, setSearchVariantInputValue] = useState("");
  const autoCompleteRef = createRef<RefSelectProps>();

  const onSelectSearchedVariant = (value: string) => {
    const selectedVariant = resultSearchVariant.items.find((single) => {
      return single.id === +value;
    });
    if (!selectedVariant) return;
    console.log("selectedVariant", selectedVariant);
    let indexSelectedVariant = listReturnProducts.findIndex((single) => {
      return single.variant_id === selectedVariant.id;
    });
    console.log("listReturnProducts", listReturnProducts);
    console.log("indexSelectedVariant", indexSelectedVariant);
    let resultListReturnProducts = [...listReturnProducts];
    if (splitLine || indexSelectedVariant === -1) {
      let newReturnProduct: OrderLineItemRequest = {
        id: new Date().getTime(),
        sku: selectedVariant.sku,
        variant_id: selectedVariant.id,
        product_id: selectedVariant.product.id,
        variant: selectedVariant.name,
        variant_barcode: selectedVariant.barcode,
        product_type: selectedVariant.product.product_type,
        quantity: 1,
        price: findPriceInVariant(
          selectedVariant.variant_prices,
          AppConfig.currency
        ),
        amount: findPriceInVariant(
          selectedVariant.variant_prices,
          AppConfig.currency
        ),
        note: "",
        type: Type.NORMAL,
        variant_image: findAvatar(selectedVariant.variant_images),
        unit: selectedVariant.product.unit,
        weight: selectedVariant.weight,
        weight_unit: selectedVariant.weight_unit,
        warranty: selectedVariant.product.preservation,
        discount_items: [
          {
            amount: 0,
            rate: 0,
            reason: "",
            value: 0,
          },
        ],
        discount_amount: 0,
        discount_rate: 0,
        composite: selectedVariant.composite,
        is_composite: selectedVariant.composite,
        discount_value: 0,
        line_amount_after_line_discount: findPriceInVariant(
          selectedVariant.variant_prices,
          AppConfig.currency
        ),
        product: selectedVariant.product.name,
        tax_include: null,
        tax_rate: findTaxInVariant(
          selectedVariant.variant_prices,
          AppConfig.currency
        ),
        show_note: false,
        gifts: [],
        position: listReturnProducts.length + 1,
      };
      resultListReturnProducts = [newReturnProduct, ...listReturnProducts];
    } else {
      // resultListReturnProducts[indexSelectedVariant].quantity += 1;
      // resultListReturnProducts[
      //   indexSelectedVariant
      // ].line_amount_after_line_discount +=
      //   resultListReturnProducts[indexSelectedVariant].price -
      //   resultListReturnProducts[indexSelectedVariant].discount_items[0].amount;
    }
    console.log("resultListReturnProducts", resultListReturnProducts);
    handleReturnProducts(resultListReturnProducts);
  };

  const renderSearchVariant = (item: OrderLineItemResponse) => {
    let avatar = item.variant_image;
    return (
      <div
        className="row-search w-100"
        style={{
          padding: 0,
          paddingRight: 20,
          paddingLeft: 20,
          display: "flex",
        }}
      >
        <div
          className="rs-left w-100"
          style={{ display: "flex", width: "100%" }}
        >
          <div style={{ marginTop: 10 }}>
            <img
              src={avatar === "" ? imgDefault : avatar}
              alt="anh"
              placeholder={imgDefault}
              style={{ width: "40px", height: "40px", borderRadius: 5 }}
            />
          </div>
          <div
            className="rs-info w-100"
            style={{ display: "flex", flexDirection: "column", marginLeft: 18 }}
          >
            <span style={{ color: "#37394D" }} className="text">
              {item.variant}
            </span>
            <span style={{ color: "#95A1AC" }} className="text p-4">
              {item.sku}
            </span>
          </div>
        </div>
        <div className="rs-right" style={{ display: "flex" }}>
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
    const queryVariant = {
      ...initQueryVariant,
      info: value,
    };
    dispatch(
      searchVariantsOrderRequestAction(queryVariant, setResultSearchVariant)
    );
  };

  const onChangeProductQuantity = (value: number, index: number) => {
    let resultListReturnProducts = [...listReturnProducts];
    resultListReturnProducts[index].quantity = Number(
      value == null ? "0" : value.toString().replace(".", "")
    );
    handleReturnProducts(resultListReturnProducts);
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
      render: (value, row, index: number) => {
        return (
          <div>
            <InputNumber
              min={1}
              max={10}
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
        <Select
          showSearch
          style={{ width: "100%" }}
          placeholder="Tìm sản phẩm mã 7... (F3)"
          optionFilterProp="children"
          filterOption={(input, option) =>
            option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          onChange={onSelectSearchedVariant}
          notFoundContent="Không tìm thấy trạng thái phụ"
        >
          {listOrderProducts &&
            listOrderProducts.map((single) => {
              return (
                <Select.Option value={single.id} key={single.id}>
                  {renderSearchVariant(single)}
                </Select.Option>
              );
            })}
        </Select>
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
