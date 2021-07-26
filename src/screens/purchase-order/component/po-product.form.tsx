import { SearchOutlined } from "@ant-design/icons";
import {
  AutoComplete,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Empty,
  Form,
  Input,
  Popover,
  Row,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import imgDefIcon from "assets/img/img-def.svg";
import { RefSelectProps } from "antd/lib/select";
import emptyProduct from "assets/icon/empty_products.svg";
import { searchVariantsRequestAction } from "domain/actions/product/products.action";
import { PageResponse } from "model/base/base-metadata.response";
import { VariantResponse } from "model/product/product.model";
import { PurchaseOrderLineItem, Vat } from "model/purchase-order/purchase-item.model";
import React, { createRef, useCallback, useMemo } from "react";
import { useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { POUtils } from "utils/POUtils";
import ProductItem from "./product-item";
import { RootReducerType } from "model/reducers/RootReducerType";
import NumberInput from "component/custom/number-input.custom";
import { formatCurrency } from "utils/AppUtils";
import PriceModal from "../model/price.modal";
import { PoFormName } from "utils/Constants";
import DiscountModal from "../model/discount.modal";
import PickManyProductModal from "../model/pick-many-product.modal";

const POProductForm: React.FC = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const productSearchRef = createRef<RefSelectProps>();
  const inputRef = createRef<Input>();
  const product_units = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.product_unit
  );
  const [visibleManyProduct, setVisibleManyProduct] = useState<boolean>(false);
  const [splitLine, setSplitLine] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [data, setData] = useState<Array<VariantResponse>>([]);
  const renderResult = useMemo(() => {
    let options: any[] = [];
    data.forEach((item: VariantResponse, index: number) => {
      options.push({
        label: <ProductItem data={item} key={item.id.toString()} />,
        value: item.id.toString(),
      });
    });
    return options;
  }, [data]);
  const onResultSearch = useCallback(
    (result: PageResponse<VariantResponse> | false) => {
      if (!result) {
        setData([]);
      } else {
        setData(result.items);
      }
    },
    []
  );
  const onSelectProduct = useCallback(
    (value: string) => {
      let index = data.findIndex((item) => item.id.toString() === value);
      if (index !== -1) {
        let old_line_items = form.getFieldValue("line_items");
        let discount_rate_total = form.getFieldValue("discount_rate");
        let discount_value_total = form.getFieldValue("discount_value");
        let variants: Array<VariantResponse> = [data[index]];
        let new_items: Array<PurchaseOrderLineItem> = [
          ...POUtils.convertVariantToLineitem(variants),
        ];
        let new_line_items = POUtils.addProduct(
          old_line_items,
          new_items,
          splitLine
        );
        let total = POUtils.totalAmount(new_line_items);
        let total_discount = POUtils.getTotalDiscount(total, discount_rate_total, discount_value_total);
        let vats = POUtils.getVatList(new_line_items);
        let total_payment = POUtils.getTotalPayment(total, total_discount, vats);
        form.setFieldsValue({ line_items: new_line_items, total: total, vats: vats, total_discount: total_discount, total_payment: total_payment });
      }
      setData([]);
      setSearchValue("");
    },
    [data, form, splitLine]
  );
  const onQuantityChange = useCallback(
    (quantity, index) => {
      let data: Array<PurchaseOrderLineItem> = form.getFieldValue("line_items");
      let discount_rate_total = form.getFieldValue("discount_rate");
      let discount_value_total = form.getFieldValue("discount_value");
      let updateItem = POUtils.updateQuantityItem(
        data[index],
        data[index].price,
        data[index].discount_rate,
        data[index].discount_value,
        quantity
      );
      data[index] = updateItem;
      let total = POUtils.totalAmount(data);
      let vats = POUtils.getVatList(data);
      let total_discount = POUtils.getTotalDiscount(total, discount_rate_total, discount_value_total);
      let total_payment = POUtils.getTotalPayment(total, total_discount, vats);
      form.setFieldsValue({ line_items: [...data], total: total, vats: vats, total_payment: total_payment, total_discount: total_discount });
    },
    [form]
  );
  const onPriceChange = useCallback(
    (price: number, type: string, discount: number, index) => {
      let data: Array<PurchaseOrderLineItem> = form.getFieldValue("line_items");
      let discount_rate_total = form.getFieldValue("discount_rate");
      let discount_value_total = form.getFieldValue("discount_value");
      let discount_rate = data[index].discount_rate;
      let discount_value = data[index].discount_value;
      if (type === "percent") {
        discount_rate = discount;
        discount_value = null;
      }
      if (type === "money") {
        discount_rate = null;
        discount_value = discount;
      }
      let updateItem = POUtils.updateQuantityItem(
        data[index],
        price,
        discount_rate,
        discount_value,
        data[index].quantity
      );
      data[index] = updateItem;
      let total = POUtils.totalAmount(data);
      let vats = POUtils.getVatList(data);
      let total_discount = POUtils.getTotalDiscount(total, discount_rate_total, discount_value_total);
      let total_payment = POUtils.getTotalPayment(total, total_discount, vats);
      form.setFieldsValue({ line_items: [...data], total: total, vats: vats, total_discount: total_discount, total_payment: total_payment});
    },
    [form]
  );
  const onBillDiscountChange = useCallback(
    (type: string, discount: number) => {
      let data: Array<PurchaseOrderLineItem> = form.getFieldValue("line_items");
      let discount_rate = form.getFieldValue("discount_rate");
      let discount_value = form.getFieldValue("discount_value");
      let total = form.getFieldValue("total");
      if (type === "percent") {
        discount_rate = discount;
        discount_value = null;
      }
      if (type === "money") {
        discount_rate = null;
        discount_value = discount;
      }
      let total_discount = POUtils.getTotalDiscount(total, discount_rate, discount_value);
      let vats = POUtils.getVatList(data);
      let total_payment = POUtils.getTotalPayment(total, total_discount, vats);
      form.setFieldsValue({
        discount_rate: discount_rate,
        discount_value: discount_value,
        total_discount: total_discount,
        total_payment: total_payment,
        vats: vats,
      });
    },
    [form]
  );
  const onPickManyProduct = useCallback(
    (items: Array<VariantResponse>) => {
      setVisibleManyProduct(false);
      let old_line_items = form.getFieldValue("line_items");
      let discount_rate = form.getFieldValue("discount_rate");
      let discount_value = form.getFieldValue("discount_value");
      let new_items: Array<PurchaseOrderLineItem> = [
        ...POUtils.convertVariantToLineitem(items),
      ];
      let new_line_items = POUtils.addProduct(
        old_line_items,
        new_items,
        splitLine
      );
      let total = POUtils.totalAmount(new_line_items);
      let total_discount = POUtils.getTotalDiscount(total, discount_rate, discount_value);
      let vats = POUtils.getVatList(new_line_items);
      let total_payment = POUtils.getTotalPayment(total, total_discount, vats);
      form.setFieldsValue({ line_items: new_line_items, total: total, vats: vats, total_payment: total_payment, total_discount: total_discount });
    },
    [form, splitLine]
  );
  const onVATChange = useCallback(
    (vat, index: number) => {
      let data: Array<PurchaseOrderLineItem> = form.getFieldValue("line_items");
      let discount_rate = form.getFieldValue("discount_rate");
      let discount_value = form.getFieldValue("discount_value");
      let updateItem = POUtils.updateVatItem(data[index], vat);
      data[index] = updateItem;
      let vats = POUtils.getVatList(data);
      let total = POUtils.totalAmount(data);
      let total_discount = POUtils.getTotalDiscount(total, discount_rate, discount_value);
      let total_payment = POUtils.getTotalPayment(total, total_discount, vats);
      form.setFieldsValue({ line_items: [...data], vats: vats, total: total, total_discount: total_discount, total_payment: total_payment});
    },
    [form]
  );
  const onSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      if (value.length >= 3) {
        dispatch(
          searchVariantsRequestAction(
            {
              status: "active",
              limit: 10,
              page: 1,
              info: value,
            },
            onResultSearch
          )
        );
      } else {
        setData([]);
      }
    },
    [dispatch, onResultSearch]
  );
  return (
    <React.Fragment>
      <Form
        form={form}
        name={PoFormName.Product}
        initialValues={{
          line_items: [],
          price_type: "import_price",
          total: 0,
          discount_rate: null,
          discount_value: null,
          total_discount: 0,
          total_payment: 0,
          vats: [],
        }}
      >
        <Card
          className="po-form margin-top-20"
          title={
            <div className="d-flex">
              <span className="title-card">THÔNG TIN SẢN PHẨM</span>
            </div>
          }
          extra={
            <Space size={20}>
              <Checkbox
                checked={splitLine}
                onChange={() => setSplitLine(!splitLine)}
              >
                Tách dòng
              </Checkbox>
              <span>Chính sách giá:</span>
              <Form.Item name="price_type" style={{ margin: "0px" }}>
                <Select
                  style={{ minWidth: 145, height: 38 }}
                  placeholder="Chính sách giá"
                >
                  <Select.Option value="import_price" color="#222222">
                    Giá nhập
                  </Select.Option>
                </Select>
              </Form.Item>
            </Space>
          }
        >
          <div className="padding-20">
            <Input.Group className="display-flex">
              <AutoComplete
                ref={productSearchRef}
                dropdownMatchSelectWidth={456}
                maxLength={255}
                value={searchValue}
                style={{ width: "100%" }}
                onSearch={onSearch}
                dropdownClassName="product"
                dropdownRender={(menu) => (
                  <div className="dropdown-custom">
                    <Button
                      icon={<AiOutlinePlusCircle size={24} />}
                      className="dropdown-add-new"
                      type="link"
                    >
                      Thêm mới sản phẩm
                    </Button>
                    {menu}
                  </div>
                )}
                onSelect={onSelectProduct}
                options={renderResult}
              >
                <Input
                  ref={inputRef}
                  size="middle"
                  className="yody-search"
                  placeholder="Tìm kiếm sản phẩm theo tên, mã SKU, mã vạch ... (F1)"
                  prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
                />
              </AutoComplete>
              <Button
                onClick={() => setVisibleManyProduct(true)}
                style={{ width: 132, marginLeft: 10 }}
              >
                Chọn nhiều
              </Button>
            </Input.Group>
            <Form.Item
              style={{ padding: 0 }}
              className="margin-top-20"
              shouldUpdate={(prevValues, curValues) =>
                prevValues.line_items !== curValues.line_items
              }
            >
              {({ getFieldValue }) => {
                let items = getFieldValue("line_items")
                  ? getFieldValue("line_items")
                  : [];
                return (
                  <Table
                    className="product-table"
                    locale={{
                      emptyText: (
                        <Empty
                          description="Đơn hàng của bạn chưa có sản phẩm"
                          image={<img src={emptyProduct} alt="" />}
                        >
                          <Button
                            type="text"
                            className="font-weight-500"
                            style={{
                              background: "rgba(42,42,134,0.05)",
                            }}
                            onClick={() => {
                              productSearchRef.current?.focus();
                            }}
                          >
                            Thêm sản phẩm ngay (F1)
                          </Button>
                        </Empty>
                      ),
                    }}
                    rowKey={(record: PurchaseOrderLineItem) =>
                      record.id?.toString()
                    }
                    columns={[
                      {
                        title: "STT",
                        align: "center",
                        width: 60,
                        render: (value, record, index) => index + 1,
                      },
                      {
                        title: "Ảnh",
                        width: 60,
                        dataIndex: "variant_image",
                        render: (value) => (
                          <div className="product-item-image">
                            <img
                              src={value === null ? imgDefIcon : value}
                              alt=""
                              className=""
                            />
                          </div>
                        ),
                      },
                      {
                        title: "Sản phẩm",
                        width: "99%",
                        dataIndex: "variant",
                        render: (
                          value: string,
                          item: PurchaseOrderLineItem
                        ) => (
                          <div>
                            <div className="product-item-sku">{item.sku}</div>
                            <div className="product-item-name">{value}</div>
                          </div>
                        ),
                      },
                      {
                        align: "center",
                        title: "Đơn vị",
                        width: 100,
                        dataIndex: "unit",
                        render: (value) => {
                          let result = "---";
                          let index = -1;
                          if (product_units) {
                            index = product_units.findIndex(
                              (item) => item.value === value
                            );
                            if (index !== -1) {
                              result = product_units[index].name;
                            }
                          }
                          return result;
                        },
                      },
                      {
                        title: (
                          <div style={{ width: "100%", textAlign: "center" }}>
                            SL
                          </div>
                        ),
                        width: 100,
                        dataIndex: "quantity",
                        render: (value, item, index) => (
                          <NumberInput
                            isFloat={false}
                            style={{ textAlign: "center" }}
                            value={value}
                            maxLength={4}
                            onChange={(quantity) =>
                              onQuantityChange(quantity, index)
                            }
                          />
                        ),
                      },
                      {
                        title: (
                          <div style={{ width: "100%", textAlign: "center" }}>
                            Giá nhập
                            <span
                              style={{
                                color: "#737373",
                                fontSize: "12px",
                                fontWeight: "normal",
                              }}
                            >
                              {" "}
                              ₫
                            </span>
                          </div>
                        ),
                        width: 140,
                        dataIndex: "price",
                        render: (value, item, index) => {
                          let type = "percent";
                          if (item.discount_value !== null) {
                            type = "money";
                          }
                          return (
                            <Popover
                              content={
                                <PriceModal
                                  price={value}
                                  type={type}
                                  discount={
                                    type === "percent"
                                      ? item.discount_rate
                                      : item.discount_value
                                  }
                                  onChange={(price, type, discount) =>
                                    onPriceChange(price, type, discount, index)
                                  }
                                />
                              }
                              trigger="click"
                              placement="bottom"
                            >
                              <Button className="product-item-price">
                                {formatCurrency(
                                  POUtils.caculatePrice(
                                    value,
                                    item.discount_rate,
                                    item.discount_value
                                  )
                                )}
                              </Button>
                            </Popover>
                          );
                        },
                      },
                      {
                        title: (
                          <div style={{ width: "100%", textAlign: "center" }}>
                            VAT
                          </div>
                        ),
                        width: 140,
                        dataIndex: "tax",
                        render: (value, item, index) => {
                          return (
                            <NumberInput
                              className="product-item-vat"
                              value={value}
                              prefix={<div>%</div>}
                              onChange={(v) => onVATChange(v, index)}
                              min={0}
                              max={100}
                              onBlur={() => {
                                debugger;
                                if (value === null) {
                                  onVATChange(0, index);
                                }
                              }}
                            />
                          );
                        },
                      },
                      {
                        dataIndex: "line_amount_after_line_discount",
                        title: (
                          <Tooltip title="Thành tiền không bao gồm thuế VAT">
                            Thành tiền
                          </Tooltip>
                        ),
                        align: "center",
                        width: 120,
                        render: (value: string) => formatCurrency(value),
                      },
                    ]}
                    dataSource={items}
                    tableLayout="fixed"
                    pagination={false}
                    scroll={{ y: 300, x: 950 }}
                    summary={(data) =>
                      data.length === 0 ? null : (
                        <Table.Summary fixed>
                          <Table.Summary.Row className="product-table-sumary">
                            <Table.Summary.Cell index={1} colSpan={4}>
                              <div className="total">Tổng</div>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell
                              align="center"
                              index={2}
                              colSpan={1}
                            >
                              {POUtils.totalQuantity(items)}
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={3} colSpan={2} />
                            <Table.Summary.Cell
                              index={4}
                              align="center"
                              colSpan={1}
                            >
                              {formatCurrency(POUtils.totalAmount(items))}
                            </Table.Summary.Cell>
                          </Table.Summary.Row>
                        </Table.Summary>
                      )
                    }
                  />
                );
              }}
            </Form.Item>
            <Row gutter={24}>
              <Col xs={24} lg={12}>
                <div className="payment-checkbox">
                  <Checkbox
                    className=""
                    onChange={() => console.log(1)}
                    style={{ fontWeight: 500 }}
                  >
                    Sử dụng giá nhập gần nhất
                  </Checkbox>
                </div>
                <div className="payment-checkbox">
                  <Checkbox
                    className=""
                    onChange={() => console.log(1)}
                    style={{ fontWeight: 500 }}
                  >
                    Giá đã bao gồm thuế VAT
                  </Checkbox>
                </div>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item
                  shouldUpdate={(prevValues, curValues) =>
                    prevValues.total !== curValues.total
                  }
                  noStyle
                >
                  {({ getFieldValue }) => {
                    let total = getFieldValue("total");
                    console.log(total);
                    return (
                      <div className="payment-row">
                        <div>Tổng tiền</div>
                        <div className="payment-row-result">
                          {total === 0 ? "-" : formatCurrency(total)}
                        </div>
                      </div>
                    );
                  }}
                </Form.Item>
                <Form.Item
                  shouldUpdate={(prevValues, curValues) =>
                    prevValues.total_discount !== curValues.total_discount
                  }
                  noStyle
                >
                  {({ getFieldValue }) => {
                    let total_discount = getFieldValue("total_discount");
                    let discount_rate = getFieldValue("discount_rate");
                    let discount_value = getFieldValue("discount_value");
                    let type = "percent";
                    if (discount_value !== null) {
                      type = "money";
                    }
                    return (
                      <div className="payment-row">
                        <Popover
                          trigger="click"
                          content={
                            <DiscountModal
                              price={total_discount}
                              discount={
                                type === "money"
                                  ? discount_value
                                  : discount_rate
                              }
                              onChange={onBillDiscountChange}
                              type={type}
                            />
                          }
                        >
                          <Typography.Link
                            style={{
                              textDecoration: "underline",
                              textDecorationColor: "#5D5D8A",
                              color: "#5D5D8A",
                            }}
                          >
                            Chiết khấu
                          </Typography.Link>
                        </Popover>
                        <div className="payment-row-result">
                          {total_discount === 0
                            ? "-"
                            : formatCurrency(total_discount)}
                        </div>
                      </div>
                    );
                  }}
                </Form.Item>
                <Form.Item
                  shouldUpdate={(prevValues, curValues) =>
                    prevValues.line_items !== curValues.line_items
                  }
                  noStyle
                >
                  {({ getFieldValue }) => {
                    let vats = getFieldValue("vats");
                    return vats.map((item: Vat) => (
                      <div className="payment-row">
                        <div>{`VAT (${item.value}%)`}</div>
                        <div className="payment-row-result">
                          {formatCurrency(item.amount)}
                        </div>
                      </div>
                    ));
                  }}
                </Form.Item>
                <Form.Item noStyle>
                  <div className="payment-row">
                    <div>Chi phí</div>
                    <div className="payment-row-result">-</div>
                  </div>
                </Form.Item>

                <Divider className="margin-top-5 margin-bottom-5" />
                <Form.Item
                  shouldUpdate={(prevValues, curValues) =>
                    prevValues.total_payment !== curValues.total_payment
                  }
                  noStyle
                >
                  {({ getFieldValue }) => {
                    let total_payment = getFieldValue("total_payment");
                    return (
                      <div className="payment-row">
                        <strong className="font-size-text">Tiền cần trả</strong>
                        <strong className="text-success font-size-text">{formatCurrency(total_payment)}</strong>
                      </div>
                    );
                  }}
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Card>
      </Form>
      <PickManyProductModal
        onSave={onPickManyProduct}
        onCancle={() => setVisibleManyProduct(false)}
        visible={visibleManyProduct}
      />
    </React.Fragment>
  );
};

export default POProductForm;
