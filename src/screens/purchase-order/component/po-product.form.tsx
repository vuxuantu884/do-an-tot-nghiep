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
  Row,
  Select,
  Space,
  Table,
  Typography,
} from "antd";
import imgDefIcon from "assets/img/img-def.svg";
import { RefSelectProps } from "antd/lib/select";
import emptyProduct from "assets/icon/empty_products.svg";
import { searchVariantsRequestAction } from "domain/actions/product/products.action";
import { PageResponse } from "model/base/base-metadata.response";
import { VariantResponse } from "model/product/product.model";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import { createRef, useCallback, useMemo } from "react";
import { useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { POUtils } from "utils/POUtils";
import ProductItem from "./product-item";
import { RootReducerType } from "model/reducers/RootReducerType";
import NumberInput from "component/custom/number-input.custom";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";

const POProductForm: React.FC = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const productSearchRef = createRef<RefSelectProps>();
  const inputRef = createRef<Input>();
  const product_units = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.product_unit
  );
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
        let variants: Array<VariantResponse> = [data[index]];
        let new_items: Array<PurchaseOrderLineItem> = [
          ...POUtils.convertVariantToLineitem(variants),
        ];
        let new_line_items = POUtils.addProduct(
          old_line_items,
          new_items,
          splitLine
        );
        form.setFieldsValue({ line_items: new_line_items });
      }
      setData([]);
      setSearchValue("");
    },
    [data, form, splitLine]
  );
  const onQuantityChange = useCallback((quantity, index) => {
    let data: Array<PurchaseOrderLineItem> = form.getFieldValue('line_items');
    let updateItem = POUtils.updateQuantityItem(data[index], data[index].price, data[index].discount_rate, data[index].discount_value, quantity);
    data[index] = updateItem;
    form.setFieldsValue({line_items: [...data]})
  }, [form]);
  const onPriceChange = useCallback((price, index) => {
    let data: Array<PurchaseOrderLineItem> = form.getFieldValue('line_items');
    let updateItem = POUtils.updateQuantityItem(data[index], price, data[index].discount_rate, data[index].discount_value, data[index].quantity);
    data[index] = updateItem;
    form.setFieldsValue({line_items: [...data]})
  }, [form]);
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
    <Form
      form={form}
      name="formPoProduct"
      initialValues={{
        line_items: [],
        price_type: "import_price",
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
                    onClick={() => {
                      productSearchRef.current?.blur()
                    }}
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
            <Button style={{ width: 132, marginLeft: 10 }}>Chọn nhiều</Button>
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
                      width: '100%',
                      dataIndex: "variant",
                      render: (value: string, item: PurchaseOrderLineItem) => (
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
                          onChange={(quantity) => onQuantityChange(quantity, index)}
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
                      render: (value, item, index) => (
                        <NumberInput
                          isFloat={false}
                          style={{ textAlign: "right", width: "100%" }}
                          value={value}
                          replace={(a: string) => replaceFormatString(a)}
                          onChange={(price) => onPriceChange(price, index)}
                          format={(dataFormat) => formatCurrency(dataFormat)}
                        />
                      ),
                    },
                    {
                      title: (
                        <div style={{ width: "100%", textAlign: "center" }}>
                          Chiết khấu
                        </div>
                      ),
                      width: 200,
                      render: (value, item, index) => {
                        let selectValue = 'percent';
                        if(item.discount_value !== null) {
                          selectValue = 'value';
                        }
                        return (
                          <div>
                            <Input.Group
                              className="product-item-discount"
                              style={{ width: "100%" }}
                              compact
                            >
                              <Select
                                className="product-item-discount-select"
                                value={selectValue}
                              >
                                <Select.Option value="percent">%</Select.Option>
                                <Select.Option value="money">₫</Select.Option>
                              </Select>
                              <NumberInput
                                className="product-item-discount-input"
                                style={{ width: "65%" }}
                                value={
                                  item.discount_rate !== null
                                    ? item.discount_rate
                                    : 0
                                }
                              />
                            </Input.Group>
                          </div>
                        );
                      },
                    },
                    {
                      dataIndex: "line_amount_after_line_discount",
                      title: "Tổng",
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
                            <div className="total">
                            Tổng
                            </div>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell align="center" index={2} colSpan={1}>
                            {POUtils.totalQuantity(items)}
                          </Table.Summary.Cell>
                          <Table.Summary.Cell align="right" index={3} colSpan={2}>
                            {formatCurrency(POUtils.totalDiscount(items))}
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={4} align="center" colSpan={1}>
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
              <div className="payment-row">
                <Checkbox
                  className=""
                  onChange={() => console.log(1)}
                  style={{fontWeight: 500}}
                >
                  Bỏ chiết khấu tự động
                </Checkbox>
              </div>
              <div className="payment-row">
                <Checkbox
                  className=""
                  onChange={() => console.log(1)}
                  style={{fontWeight: 500}}
                >
                  Không tính thuế VAT
                </Checkbox>
              </div>
              <div className="payment-row">
                <Checkbox
                  className=""
                  onChange={() => console.log(1)}
                  style={{fontWeight: 500}}
                >
                  Bỏ tích điểm tự động
                </Checkbox>
              </div>
            </Col>
            <Col xs={24} lg={12}>
              <Row className="payment-row" justify="space-between">
                <div className="font-weight-500">Tổng tiền</div>
                <div></div>
              </Row>
              <Row
                className="payment-row"
                justify="space-between"
                align="middle"
              >
                <Space align="center">
                  <Typography.Link
                    className="font-weight-500"
                    style={{
                      textDecoration: "underline",
                      textDecorationColor: "#5D5D8A",
                      color: "#5D5D8A"
                    }}
                  >
                    Chiết khấu
                  </Typography.Link>
                </Space>
                <div className="font-weight-500 ">
              
                </div>
              </Row>

              <Row
                className="payment-row"
                justify="space-between"
                align="middle"
              >
                <Space align="center">
                <Typography.Link
                    className="font-weight-500"
                    style={{
                      textDecoration: "underline",
                      textDecorationColor: "#5D5D8A",
                      color: "#5D5D8A"
                    }}
                  >
                    Mã giảm giá
                  </Typography.Link>
                </Space>
                <div className="font-weight-500 ">-</div>
              </Row>
              <Divider className="margin-top-5 margin-bottom-5" />
              <Row className="payment-row" justify="space-between"> 
                <strong className="font-size-text">Khách cần phải trả:</strong>
                <strong className="text-success font-size-text">
                 
                </strong>
              </Row>
            </Col>
          </Row>
        </div>
      </Card>
    </Form>
  );
};

export default POProductForm;
