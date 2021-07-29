import { EditOutlined, SearchOutlined } from "@ant-design/icons";
import {
  AutoComplete,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Empty,
  Form,
  FormInstance,
  Input,
  Popover,
  Row,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import classNames from "classnames";
import imgDefIcon from "assets/img/img-def.svg";
import { RefSelectProps } from "antd/lib/select";
import emptyProduct from "assets/icon/empty_products.svg";
import { searchVariantsRequestAction } from "domain/actions/product/products.action";
import { PageResponse } from "model/base/base-metadata.response";
import { VariantResponse } from "model/product/product.model";
import {
  PurchaseOrderLineItem,
  Vat,
} from "model/purchase-order/purchase-item.model";
import React, { createRef, useCallback, useMemo } from "react";
import { useState } from "react";
import { AiOutlineClose, AiOutlinePlusCircle } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { POUtils } from "utils/POUtils";
import ProductItem from "./product-item";
import { RootReducerType } from "model/reducers/RootReducerType";
import NumberInput from "component/custom/number-input.custom";
import { formatCurrency } from "utils/AppUtils";
import PriceModal from "../modal/price.modal";
import DiscountModal from "../modal/discount.modal";
import PickManyProductModal from "../modal/pick-many-product.modal";
import ExpenseModal from "../modal/expense.modal";
import { DiscountType, POField } from "model/purchase-order/po-field";
import { CostLine } from "model/purchase-order/cost-line.model";
type POProductProps = {
  formMain: FormInstance;
};
const POProductForm: React.FC<POProductProps> = (props: POProductProps) => {
  const dispatch = useDispatch();
  const { formMain } = props;
  const productSearchRef = createRef<RefSelectProps>();
  const inputRef = createRef<Input>();
  const product_units = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.product_unit
  );
  const [visibleManyProduct, setVisibleManyProduct] = useState<boolean>(false);
  const [visibleExpense, setVisibleExpense] = useState<boolean>(false);
  const [splitLine, setSplitLine] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [data, setData] = useState<Array<VariantResponse>>([]);
  const [costLines, setCostLines] = useState<Array<CostLine>>([]);
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
        let old_line_items = formMain.getFieldValue(POField.line_items);
        let trade_discount_rate = formMain.getFieldValue(
          POField.trade_discount_rate
        );
        let trade_discount_value = formMain.getFieldValue(
          POField.trade_discount_value
        );
        let payment_discount_rate = formMain.getFieldValue(
          POField.payment_discount_rate
        );
        let payment_discount_value = formMain.getFieldValue(
          POField.trade_discount_value
        );
        let total_cost_lines = formMain.getFieldValue(POField.total_cost_lines);
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
        console.log("total", total);
        let vats = POUtils.getVatList(
          new_line_items,
          trade_discount_rate,
          trade_discount_value
        );
        let trade_discount_amount = POUtils.getTotalDiscount(
          total,
          trade_discount_rate,
          trade_discount_value
        );
        let total_after_tax = POUtils.getTotalAfterTax(
          total,
          trade_discount_amount,
          vats
        );
        let payment_discount_amount = POUtils.getTotalDiscount(
          total_after_tax,
          payment_discount_rate,
          payment_discount_value
        );
        let total_payment = POUtils.getTotalPayment(
          total,
          trade_discount_amount,
          payment_discount_amount,
          total_cost_lines,
          vats
        );
        formMain.setFieldsValue({
          line_items: new_line_items,
          total: total,
          vats: vats,
          trade_discount_amount: trade_discount_amount,
          payment_discount_amount: payment_discount_amount,
          total_payment: total_payment,
        });
      }
      setData([]);
      setSearchValue("");
    },
    [data, formMain, splitLine]
  );
  const onDeleteItem = useCallback(
    (index: number) => {
      let old_line_items: Array<PurchaseOrderLineItem> = formMain.getFieldValue(
        POField.line_items
      );
      let trade_discount_rate = formMain.getFieldValue(
        POField.trade_discount_rate
      );
      let trade_discount_value = formMain.getFieldValue(
        POField.trade_discount_value
      );
      let payment_discount_rate = formMain.getFieldValue(
        POField.payment_discount_rate
      );
      let payment_discount_value = formMain.getFieldValue(
        POField.trade_discount_value
      );
      let total_cost_lines = formMain.getFieldValue(POField.total_cost_lines);
      old_line_items.splice(index, 1);
      let total = POUtils.totalAmount(old_line_items);
      let vats = POUtils.getVatList(
        old_line_items,
        trade_discount_rate,
        trade_discount_value
      );
      let trade_discount_amount = POUtils.getTotalDiscount(
        total,
        trade_discount_rate,
        trade_discount_value
      );
      let total_after_tax = POUtils.getTotalAfterTax(
        total,
        trade_discount_amount,
        vats
      );
      let payment_discount_amount = POUtils.getTotalDiscount(
        total_after_tax,
        payment_discount_rate,
        payment_discount_value
      );
      let total_payment = POUtils.getTotalPayment(
        total,
        trade_discount_amount,
        payment_discount_amount,
        total_cost_lines,
        vats
      );
      formMain.setFieldsValue({
        line_items: [...old_line_items],
        total: total,
        vats: vats,
        trade_discount_amount: trade_discount_amount,
        payment_discount_amount: payment_discount_amount,
        total_payment: total_payment,
      });
    },
    [formMain]
  );
  const onQuantityChange = useCallback(
    (quantity, index) => {
      let data: Array<PurchaseOrderLineItem> = formMain.getFieldValue(
        POField.line_items
      );
      let trade_discount_rate = formMain.getFieldValue(
        POField.trade_discount_rate
      );
      let trade_discount_value = formMain.getFieldValue(
        POField.trade_discount_value
      );
      let payment_discount_rate = formMain.getFieldValue(
        POField.payment_discount_rate
      );
      let payment_discount_value = formMain.getFieldValue(
        POField.trade_discount_value
      );
      let total_cost_lines = formMain.getFieldValue(POField.total_cost_lines);
      let updateItem = POUtils.updateQuantityItem(
        data[index],
        data[index].price,
        data[index].discount_rate,
        data[index].discount_value,
        quantity
      );
      data[index] = updateItem;
      let total = POUtils.totalAmount(data);
      let vats = POUtils.getVatList(
        data,
        trade_discount_rate,
        trade_discount_value
      );
      let trade_discount_amount = POUtils.getTotalDiscount(
        total,
        trade_discount_rate,
        trade_discount_value
      );
      let total_after_tax = POUtils.getTotalAfterTax(
        total,
        trade_discount_amount,
        vats
      );
      let payment_discount_amount = POUtils.getTotalDiscount(
        total_after_tax,
        payment_discount_rate,
        payment_discount_value
      );
      let total_payment = POUtils.getTotalPayment(
        total,
        trade_discount_amount,
        payment_discount_amount,
        total_cost_lines,
        vats
      );
      formMain.setFieldsValue({
        line_items: [...data],
        total: total,
        vats: vats,
        trade_discount_amount: trade_discount_amount,
        payment_discount_amount: payment_discount_amount,
        total_payment: total_payment,
      });
    },
    [formMain]
  );
  const onPriceChange = useCallback(
    (price: number, type: string, discount: number, index) => {
      let data: Array<PurchaseOrderLineItem> = formMain.getFieldValue(
        POField.line_items
      );
      let trade_discount_rate = formMain.getFieldValue(
        POField.trade_discount_rate
      );
      let trade_discount_value = formMain.getFieldValue(
        POField.trade_discount_value
      );
      let payment_discount_rate = formMain.getFieldValue(
        POField.payment_discount_rate
      );
      let payment_discount_value = formMain.getFieldValue(
        POField.payment_discount_value
      );
      let total_cost_lines = formMain.getFieldValue(POField.total_cost_lines);
      let discount_rate = data[index].discount_rate;
      let discount_value = data[index].discount_value;
      if (type === DiscountType.percent) {
        discount_rate = discount;
        discount_value = null;
      }
      if (type === DiscountType.money) {
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
      let vats = POUtils.getVatList(
        data,
        trade_discount_rate,
        trade_discount_value
      );
      let trade_discount_amount = POUtils.getTotalDiscount(
        total,
        trade_discount_rate,
        trade_discount_value
      );
      let total_after_tax = POUtils.getTotalAfterTax(
        total,
        trade_discount_amount,
        vats
      );
      let payment_discount_amount = POUtils.getTotalDiscount(
        total_after_tax,
        payment_discount_rate,
        payment_discount_value
      );
      let total_payment = POUtils.getTotalPayment(
        total,
        trade_discount_amount,
        payment_discount_amount,
        total_cost_lines,
        vats
      );
      formMain.setFieldsValue({
        line_items: [...data],
        total: total,
        vats: vats,
        trade_discount_amount: trade_discount_amount,
        payment_discount_amount: payment_discount_amount,
        total_payment: total_payment,
      });
    },
    [formMain]
  );
  const onPaymentDiscountChange = useCallback(
    (type: string, discount: number) => {
      let trade_discount_amount = formMain.getFieldValue(
        POField.trade_discount_amount
      );
      let vats = formMain.getFieldValue(POField.vats);
      let total = formMain.getFieldValue(POField.total);
      let total_cost_lines = formMain.getFieldValue(POField.total_cost_lines);
      let payment_discount_rate = null;
      let payment_discount_value = null;
      if (type === DiscountType.percent) {
        payment_discount_rate = discount;
      }
      if (type === DiscountType.money) {
        payment_discount_value = discount;
      }
      let total_after_tax = POUtils.getTotalAfterTax(
        total,
        trade_discount_amount,
        vats
      );
      let payment_discount_amount = POUtils.getTotalDiscount(
        total_after_tax,
        payment_discount_rate,
        payment_discount_value
      );
      let total_payment = POUtils.getTotalPayment(
        total,
        trade_discount_amount,
        payment_discount_amount,
        total_cost_lines,
        vats
      );
      formMain.setFieldsValue({
        payment_discount_rate: payment_discount_rate,
        payment_discount_value: payment_discount_value,
        payment_discount_amount: payment_discount_amount,
        total_payment: total_payment,
      });
    },
    [formMain]
  );
  const onTradeDiscountChange = useCallback(
    (type: string, discount: number) => {
      let trade_discount_rate = null;
      let trade_discount_value = null;
      let total = formMain.getFieldValue(POField.total);
      let data = formMain.getFieldValue(POField.line_items);
      let payment_discount_rate = formMain.getFieldValue(
        POField.payment_discount_rate
      );
      let payment_discount_value = formMain.getFieldValue(
        POField.payment_discount_value
      );
      let total_cost_lines = formMain.getFieldValue(POField.total_cost_lines);
      if (type === DiscountType.percent) {
        trade_discount_rate = discount;
      }
      if (type === DiscountType.money) {
        trade_discount_value = discount;
      }
      let vats = POUtils.getVatList(
        data,
        trade_discount_rate,
        trade_discount_value
      );
      let trade_discount_amount = POUtils.getTotalDiscount(
        total,
        trade_discount_rate,
        trade_discount_value
      );
      let total_after_tax = POUtils.getTotalAfterTax(
        total,
        trade_discount_amount,
        vats
      );
      let payment_discount_amount = POUtils.getTotalDiscount(
        total_after_tax,
        payment_discount_rate,
        payment_discount_value
      );
      let total_payment = POUtils.getTotalPayment(
        total,
        trade_discount_amount,
        payment_discount_amount,
        total_cost_lines,
        vats
      );
      formMain.setFieldsValue({
        trade_discount_rate: trade_discount_rate,
        trade_discount_value: trade_discount_value,
        trade_discount_amount: trade_discount_amount,
        payment_discount_amount: payment_discount_amount,
        total_payment: total_payment,
        vats: vats,
      });
    },
    [formMain]
  );
  const onPickManyProduct = useCallback(
    (items: Array<VariantResponse>) => {
      setVisibleManyProduct(false);
      let old_line_items = formMain.getFieldValue(POField.line_items);
      let trade_discount_rate = formMain.getFieldValue(
        POField.trade_discount_rate
      );
      let trade_discount_value = formMain.getFieldValue(
        POField.trade_discount_value
      );
      let payment_discount_rate = formMain.getFieldValue(
        POField.payment_discount_rate
      );
      let payment_discount_value = formMain.getFieldValue(
        POField.trade_discount_value
      );
      let total_cost_lines = formMain.getFieldValue(POField.total_cost_lines);
      let new_items: Array<PurchaseOrderLineItem> = [
        ...POUtils.convertVariantToLineitem(items),
      ];
      let new_line_items = POUtils.addProduct(
        old_line_items,
        new_items,
        splitLine
      );
      let total = POUtils.totalAmount(new_line_items);

      let vats = POUtils.getVatList(
        new_line_items,
        trade_discount_rate,
        trade_discount_value
      );
      let trade_discount_amount = POUtils.getTotalDiscount(
        total,
        trade_discount_rate,
        trade_discount_value
      );
      let total_after_tax = POUtils.getTotalAfterTax(
        total,
        trade_discount_amount,
        vats
      );
      let payment_discount_amount = POUtils.getTotalDiscount(
        total_after_tax,
        payment_discount_rate,
        payment_discount_value
      );
      let total_payment = POUtils.getTotalPayment(
        total_after_tax,
        trade_discount_amount,
        payment_discount_amount,
        total_cost_lines,
        vats
      );
      formMain.setFieldsValue({
        line_items: new_line_items,
        total: total,
        vats: vats,
        total_payment: total_payment,
        trade_discount_amount: trade_discount_amount,
        payment_discount_amount: payment_discount_amount,
      });
    },
    [formMain, splitLine]
  );
  const onVATChange = useCallback(
    (vat, index: number) => {
      let data: Array<PurchaseOrderLineItem> = formMain.getFieldValue(
        POField.line_items
      );
      let trade_discount_rate = formMain.getFieldValue(
        POField.trade_discount_rate
      );
      let trade_discount_value = formMain.getFieldValue(
        POField.trade_discount_value
      );
      let payment_discount_amount = formMain.getFieldValue(
        POField.payment_discount_amount
      );
      let trade_discount_amount = formMain.getFieldValue(
        POField.trade_discount_amount
      );
      let total_cost_lines = formMain.getFieldValue(POField.total_cost_lines);
      let total = formMain.getFieldValue(POField.total);
      let updateItem = POUtils.updateVatItem(data[index], vat);
      data[index] = updateItem;
      let vats = POUtils.getVatList(
        data,
        trade_discount_rate,
        trade_discount_value
      );
      let total_payment = POUtils.getTotalPayment(
        total,
        trade_discount_amount,
        payment_discount_amount,
        total_cost_lines,
        vats
      );
      formMain.setFieldsValue({
        line_items: [...data],
        vats: vats,
        total_payment: total_payment,
      });
    },
    [formMain]
  );
  const onNoteChange = useCallback(
    (value: string, index: number) => {
      let data: Array<PurchaseOrderLineItem> = formMain.getFieldValue(
        POField.line_items
      );
      data[index].note = value;
      formMain.setFieldsValue({
        line_items: [...data],
      });
    },
    [formMain]
  );
  const onOkExpense = useCallback(
    (result: Array<CostLine>) => {
      let total = formMain.getFieldValue(POField.total);
      let payment_discount_amount = formMain.getFieldValue(
        POField.payment_discount_amount
      );
      let trade_discount_amount = formMain.getFieldValue(
        POField.trade_discount_amount
      );
      let vats = formMain.getFieldValue(POField.vats);
      let total_cost_lines = POUtils.getTotaExpense(result);
      let total_payment = POUtils.getTotalPayment(
        total,
        trade_discount_amount,
        payment_discount_amount,
        total_cost_lines,
        vats
      );
      formMain.setFieldsValue({
        total_payment: total_payment,
        total_cost_lines: total_cost_lines,
        cost_lines: result,
      });
      setVisibleExpense(false);
    },
    [formMain]
  );
  const onSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      if (value.trim() !== '' && value.length >= 3) {
        dispatch(
          searchVariantsRequestAction(
            {
              status: "active",
              limit: 10,
              page: 1,
              info: value.trim(),
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
            <Form.Item name="policy_price_code" style={{ margin: "0px" }}>
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
          <Form.Item noStyle name={POField.line_items} hidden>
            <Input />
          </Form.Item>
          <Form.Item
            style={{ padding: 0 }}
            className="margin-top-20"
            shouldUpdate={(prevValues, curValues) =>
              prevValues[POField.line_items] !== curValues[POField.line_items]
            }
          >
            {({ getFieldValue }) => {
              let items = getFieldValue(POField.line_items)
                ? getFieldValue(POField.line_items)
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
                  rowKey={(record: PurchaseOrderLineItem) => record.temp_id}
                  rowClassName="product-table-row"
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
                      className: "ant-col-info",
                      dataIndex: "variant",
                      render: (
                        value: string,
                        item: PurchaseOrderLineItem,
                        index: number
                      ) => (
                        <div>
                          <div>
                            <div className="product-item-sku">{item.sku}</div>
                            <div className="product-item-name">{value}</div>
                          </div>
                          <Input
                            addonBefore={<EditOutlined />}
                            className={classNames(
                              "product-item-note-input",
                              item.note === "" && "product-item-note"
                            )}
                            placeholder="Nhập ghi chú"
                            value={item.note}
                            onChange={(e) =>
                              onNoteChange(e.target.value, index)
                            }
                          />
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
                        <div style={{ width: "100%", textAlign: "center", flexDirection: 'column', display: 'flex', }}>
                          SL
                          <div style={{color: '#2A2A86', fontWeight: 'normal'}}>({POUtils.totalQuantity(items)})</div>
                        </div>
                      ),
                      width: 100,
                      dataIndex: "quantity",
                      render: (value, item, index) => (
                        <NumberInput
                          isFloat={false}
                          style={{ textAlign: "center" }}
                          value={value}
                          min={1}
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
                      width: 90,
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
                        </Tooltip>
                      ),
                      align: "center",
                      width: 120,
                      render: (value: string) => formatCurrency(value),
                    },
                    {
                      title: "",
                      width: 40,
                      render: (value: string, item, index: number) => (
                        <Button
                          onClick={() => onDeleteItem(index)}
                          className="product-item-delete"
                          icon={<AiOutlineClose />}
                        />
                      ),
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
                          <Table.Summary.Cell index={3} colSpan={1} />
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
              {/* <div className="payment-checkbox">
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
              </div> */}
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
              <Form.Item name={POField.trade_discount_amount} hidden noStyle>
                <Input />
              </Form.Item>
              <Form.Item name={POField.trade_discount_rate} hidden noStyle>
                <Input />
              </Form.Item>
              <Form.Item name={POField.trade_discount_value} hidden noStyle>
                <Input />
              </Form.Item>
              <Form.Item
                shouldUpdate={(prevValues, curValues) =>
                  prevValues.trade_discount_amount !==
                  curValues.trade_discount_amount
                }
                noStyle
              >
                {({ getFieldValue }) => {
                  let total = getFieldValue(POField.total);
                  let trade_discount_amount = getFieldValue(
                    POField.trade_discount_amount
                  );
                  let discount_rate = getFieldValue(
                    POField.trade_discount_rate
                  );
                  let discount_value = getFieldValue(
                    POField.trade_discount_value
                  );
                  let type = DiscountType.percent;
                  if (discount_value !== null) {
                    type = DiscountType.money;
                  }
                  return (
                    <div className="payment-row">
                      <Popover
                        trigger="click"
                        content={
                          <DiscountModal
                            price={total}
                            discount={
                              type === DiscountType.money
                                ? discount_value
                                : discount_rate
                            }
                            onChange={onTradeDiscountChange}
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
                          Chiết khấu thương mại
                        </Typography.Link>
                      </Popover>
                      <div className="payment-row-result">
                        {trade_discount_amount === 0
                          ? "-"
                          : formatCurrency(Math.round(trade_discount_amount))}
                      </div>
                    </div>
                  );
                }}
              </Form.Item>
              <Form.Item name={POField.payment_discount_amount} hidden noStyle>
                <Input />
              </Form.Item>
              <Form.Item name={POField.payment_discount_rate} hidden noStyle>
                <Input />
              </Form.Item>
              <Form.Item name={POField.payment_discount_value} hidden noStyle>
                <Input />
              </Form.Item>
              <Form.Item
                shouldUpdate={(prevValues, curValues) =>
                  prevValues.payment_discount_amount !==
                  curValues.payment_discount_amount
                }
                noStyle
              >
                {({ getFieldValue }) => {
                  let total = getFieldValue(POField.total);
                  let trade_discount_amount = getFieldValue(
                    POField.trade_discount_amount
                  );
                  let vats = getFieldValue(POField.vats);
                  let total_after_tax = POUtils.getTotalAfterTax(
                    total,
                    trade_discount_amount,
                    vats
                  );
                  let payment_discount_amount = getFieldValue(
                    POField.payment_discount_amount
                  );
                  let discount_rate = getFieldValue(
                    POField.payment_discount_rate
                  );
                  let discount_value = getFieldValue(
                    POField.payment_discount_value
                  );
                  let type = DiscountType.percent;
                  if (discount_value !== null) {
                    type = DiscountType.money;
                  }
                  return (
                    <div className="payment-row">
                      <Popover
                        trigger="click"
                        content={
                          <DiscountModal
                            price={total_after_tax}
                            discount={
                              type === "money" ? discount_value : discount_rate
                            }
                            onChange={onPaymentDiscountChange}
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
                          Chiết khấu thanh toán
                        </Typography.Link>
                      </Popover>
                      <div className="payment-row-result">
                        {payment_discount_amount === 0
                          ? "-"
                          : formatCurrency(Math.round(payment_discount_amount))}
                      </div>
                    </div>
                  );
                }}
              </Form.Item>
              <Form.Item
                shouldUpdate={(prevValues, curValues) =>
                  prevValues.vats !== curValues.vats
                }
                noStyle
              >
                {({ getFieldValue }) => {
                  let vats = getFieldValue("vats");
                  return vats.map((item: Vat) => (
                    <div className="payment-row">
                      <div>{`VAT (${item.value}%)`}</div>
                      <div className="payment-row-result">
                        {formatCurrency(Math.round(item.amount))}
                      </div>
                    </div>
                  ));
                }}
              </Form.Item>
              <Form.Item
                shouldUpdate={(prevValues, curValues) =>
                  prevValues.total_cost_lines !== curValues.total_cost_lines
                }
                noStyle
              >
                {({ getFieldValue }) => {
                  let total_cost_lines = getFieldValue(POField.total_cost_lines);
                  let cost_lines = getFieldValue(POField.cost_lines);
                  return (
                    <div className="payment-row">
                      <Typography.Link
                        onClick={() => {
                          setCostLines(cost_lines);
                          setVisibleExpense(true)
                        }}
                        style={{
                          textDecoration: "underline",
                          textDecorationColor: "#5D5D8A",
                          color: "#5D5D8A",
                        }}
                      >
                        Chi phí
                      </Typography.Link>
                      <div className="payment-row-result">
                        {total_cost_lines === 0
                          ? "-"
                          : formatCurrency(total_cost_lines)}
                      </div>
                    </div>
                  );
                }}
              </Form.Item>
              <Divider className="margin-top-5 margin-bottom-5" />

              <Form.Item name={POField.total_payment} hidden noStyle>
                <Input />
              </Form.Item>
              <Form.Item
                shouldUpdate={(prevValues, curValues) =>
                  prevValues[POField.total_payment] !==
                  curValues[POField.total_payment]
                }
                noStyle
              >
                {({ getFieldValue }) => {
                  let total_payment = getFieldValue(POField.total_payment);
                  return (
                    <div className="payment-row">
                      <strong className="font-size-text">Tiền cần trả</strong>
                      <strong className="text-success font-size-text">
                        {formatCurrency(Math.round(total_payment))}
                      </strong>
                    </div>
                  );
                }}
              </Form.Item>
            </Col>
          </Row>
        </div>
      </Card>
      <ExpenseModal
        visible={visibleExpense}
        onCancel={() => setVisibleExpense(false)}
        onOk={onOkExpense}
        costLines={costLines}
      />
      <PickManyProductModal
        onSave={onPickManyProduct}
        onCancle={() => setVisibleManyProduct(false)}
        visible={visibleManyProduct}
        
      />
    </React.Fragment>
  );
};

export default POProductForm;
