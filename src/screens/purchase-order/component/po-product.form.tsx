import { EditOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  FormInstance,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tooltip,
} from "antd";
import classNames from "classnames";
import imgDefIcon from "assets/img/img-def.svg";
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
import { AiOutlineClose } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { POUtils } from "utils/POUtils";
import ProductItem from "./product-item";
// import { RootReducerType } from "model/reducers/RootReducerType";
import NumberInput from "component/custom/number-input.custom";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import PickManyProductModal from "../modal/pick-many-product.modal";
// import ExpenseModal from "../modal/expense.modal";
import { DiscountType, POField } from "model/purchase-order/po-field";
// import { CostLine } from "model/purchase-order/cost-line.model";
import CustomAutoComplete from "component/custom/autocomplete.cusom";
import { AppConfig } from "config/app.config";
import { PurchaseProcument } from "model/purchase-order/purchase-procument";
import { Link } from "react-router-dom";
import UrlConfig, { BASE_NAME_ROUTER } from "config/url.config";
import { POStatus } from "utils/Constants";
type POProductProps = {
  formMain: FormInstance;
  isEdit: boolean;
};
var position = 0;
const POProductForm: React.FC<POProductProps> = (props: POProductProps) => {
  const dispatch = useDispatch();
  const { formMain, isEdit } = props;
  const productSearchRef = createRef<CustomAutoComplete>();
  const [loadingSearch, setLoadingSearch] = useState(false);
  // const product_units = useSelector(
  //   (state: RootReducerType) => state.bootstrapReducer.data?.product_unit
  // );
  const [visibleManyProduct, setVisibleManyProduct] = useState<boolean>(false);
  // const [visibleExpense, setVisibleExpense] = useState<boolean>(false);
  // const [splitLine, setSplitLine] = useState<boolean>(false);
  const [data, setData] = useState<Array<VariantResponse>>([]);
  // const [costLines, setCostLines] = useState<Array<CostLine>>([]);
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
      setLoadingSearch(false);
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
        let total_cost_line = formMain.getFieldValue(POField.total_cost_line);
        let variants: Array<VariantResponse> = [data[index]];
        let new_items: Array<PurchaseOrderLineItem> = [
          ...POUtils.convertVariantToLineitem(variants, position),
        ];
        position = position + new_items.length;
        let new_line_items = POUtils.addProduct(
          old_line_items,
          new_items,
          false
        );
        let untaxed_amount = POUtils.totalAmount(new_line_items);
        let tax_lines = POUtils.getVatList(
          new_line_items,
          trade_discount_rate,
          trade_discount_value
        );
        let trade_discount_amount = POUtils.getTotalDiscount(
          untaxed_amount,
          trade_discount_rate,
          trade_discount_value
        );
        let total_after_tax = POUtils.getTotalAfterTax(
          untaxed_amount,
          trade_discount_amount,
          tax_lines
        );
        let payment_discount_amount = POUtils.getTotalDiscount(
          total_after_tax,
          payment_discount_rate,
          payment_discount_value
        );
        let total = POUtils.getTotalPayment(
          untaxed_amount,
          trade_discount_amount,
          payment_discount_amount,
          total_cost_line,
          tax_lines
        );
        let currentProcument: Array<PurchaseProcument> = formMain.getFieldValue(
          POField.procurements
        );
        let newProcument: Array<PurchaseProcument> = POUtils.getNewProcument(
          currentProcument,
          new_line_items
        );
        formMain.setFieldsValue({
          line_items: new_line_items,
          untaxed_amount: untaxed_amount,
          tax_lines: tax_lines,
          trade_discount_amount: trade_discount_amount,
          payment_discount_amount: payment_discount_amount,
          [POField.total]: total,
          [POField.procurements]: newProcument,
        });
      }
      setData([]);
    },
    [data, formMain]
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
      let total_cost_line = formMain.getFieldValue(POField.total_cost_line);
      old_line_items.splice(index, 1);
      let untaxed_amount = POUtils.totalAmount(old_line_items);
      let tax_lines = POUtils.getVatList(
        old_line_items,
        trade_discount_rate,
        trade_discount_value
      );
      let trade_discount_amount = POUtils.getTotalDiscount(
        untaxed_amount,
        trade_discount_rate,
        trade_discount_value
      );
      let total_after_tax = POUtils.getTotalAfterTax(
        untaxed_amount,
        trade_discount_amount,
        tax_lines
      );
      let payment_discount_amount = POUtils.getTotalDiscount(
        total_after_tax,
        payment_discount_rate,
        payment_discount_value
      );
      let total = POUtils.getTotalPayment(
        untaxed_amount,
        trade_discount_amount,
        payment_discount_amount,
        total_cost_line,
        tax_lines
      );
      let currentProcument: Array<PurchaseProcument> = formMain.getFieldValue(
        POField.procurements
      );
      let newProcument: Array<PurchaseProcument> = POUtils.getNewProcument(
        currentProcument,
        old_line_items
      );
      formMain.setFieldsValue({
        line_items: [...old_line_items],
        untaxed_amount: untaxed_amount,
        tax_lines: tax_lines,
        trade_discount_amount: trade_discount_amount,
        payment_discount_amount: payment_discount_amount,
        total: total,
        [POField.procurements]: newProcument,
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
      let total_cost_line = formMain.getFieldValue(POField.total_cost_line);
      let updateItem = POUtils.updateQuantityItem(
        data[index],
        data[index].price,
        data[index].discount_rate,
        data[index].discount_value,
        quantity
      );
      data[index] = updateItem;
      let untaxed_amount = POUtils.totalAmount(data);
      let tax_lines = POUtils.getVatList(
        data,
        trade_discount_rate,
        trade_discount_value
      );
      let trade_discount_amount = POUtils.getTotalDiscount(
        untaxed_amount,
        trade_discount_rate,
        trade_discount_value
      );
      let total_after_tax = POUtils.getTotalAfterTax(
        untaxed_amount,
        trade_discount_amount,
        tax_lines
      );
      let payment_discount_amount = POUtils.getTotalDiscount(
        total_after_tax,
        payment_discount_rate,
        payment_discount_value
      );
      let total = POUtils.getTotalPayment(
        untaxed_amount,
        trade_discount_amount,
        payment_discount_amount,
        total_cost_line,
        tax_lines
      );
      let currentProcument: Array<PurchaseProcument> = formMain.getFieldValue(
        POField.procurements
      );
      let newProcument: Array<PurchaseProcument> = POUtils.getNewProcument(
        currentProcument,
        data
      );
      formMain.setFieldsValue({
        line_items: [...data],
        total: total,
        tax_lines: tax_lines,
        trade_discount_amount: trade_discount_amount,
        payment_discount_amount: payment_discount_amount,
        untaxed_amount: untaxed_amount,
        [POField.procurements]: newProcument,
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
      let total_cost_line = formMain.getFieldValue(POField.total_cost_line);
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
      let untaxed_amount = POUtils.totalAmount(data);
      let tax_lines = POUtils.getVatList(
        data,
        trade_discount_rate,
        trade_discount_value
      );
      let trade_discount_amount = POUtils.getTotalDiscount(
        untaxed_amount,
        trade_discount_rate,
        trade_discount_value
      );
      let total_after_tax = POUtils.getTotalAfterTax(
        untaxed_amount,
        trade_discount_amount,
        tax_lines
      );
      let payment_discount_amount = POUtils.getTotalDiscount(
        total_after_tax,
        payment_discount_rate,
        payment_discount_value
      );
      let total = POUtils.getTotalPayment(
        untaxed_amount,
        trade_discount_amount,
        payment_discount_amount,
        total_cost_line,
        tax_lines
      );
      formMain.setFieldsValue({
        line_items: [...data],
        total: total,
        tax_lines: tax_lines,
        trade_discount_amount: trade_discount_amount,
        payment_discount_amount: payment_discount_amount,
        untaxed_amount: untaxed_amount,
      });
    },
    [formMain]
  );
  const onPickManyProduct = useCallback(
    (items: Array<VariantResponse>) => {
      console.log(items);
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
      let total_cost_line = formMain.getFieldValue(POField.total_cost_line);
      let new_items: Array<PurchaseOrderLineItem> = [
        ...POUtils.convertVariantToLineitem(items, position),
      ];
      position = position + new_items.length;
      let new_line_items = POUtils.addProduct(
        old_line_items,
        new_items,
        false
      );
      let untaxed_amount = POUtils.totalAmount(new_line_items);

      let tax_lines = POUtils.getVatList(
        new_line_items,
        trade_discount_rate,
        trade_discount_value
      );
      let trade_discount_amount = POUtils.getTotalDiscount(
        untaxed_amount,
        trade_discount_rate,
        trade_discount_value
      );
      let total_after_tax = POUtils.getTotalAfterTax(
        untaxed_amount,
        trade_discount_amount,
        tax_lines
      );
      let payment_discount_amount = POUtils.getTotalDiscount(
        total_after_tax,
        payment_discount_rate,
        payment_discount_value
      );
      let total = POUtils.getTotalPayment(
        total_after_tax,
        trade_discount_amount,
        payment_discount_amount,
        total_cost_line,
        tax_lines
      );
      let currentProcument: Array<PurchaseProcument> = formMain.getFieldValue(
        POField.procurements
      );
      let newProcument: Array<PurchaseProcument> = POUtils.getNewProcument(
        currentProcument,
        new_line_items
      );
      formMain.setFieldsValue({
        line_items: new_line_items,
        untaxed_amount: untaxed_amount,
        tax_lines: tax_lines,
        total: total,
        trade_discount_amount: trade_discount_amount,
        payment_discount_amount: payment_discount_amount,
        [POField.procurements]: newProcument,
      });
    },
    [formMain]
  );
  const onTaxChange = useCallback(
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
      let trade_discount_amount = formMain.getFieldValue(
        POField.trade_discount_amount
      );
      let payment_discount_rate = formMain.getFieldValue(
        POField.payment_discount_rate
      );
      let payment_discount_value = formMain.getFieldValue(
        POField.payment_discount_value
      );
      let total_cost_line = formMain.getFieldValue(POField.total_cost_line);
      let untaxed_amount = formMain.getFieldValue(POField.untaxed_amount);
      let updateItem = POUtils.updateVatItem(
        data[index],
        vat,
        data,
        trade_discount_rate,
        trade_discount_value
      );
      data[index] = updateItem;
      let tax_lines = POUtils.getVatList(
        data,
        trade_discount_rate,
        trade_discount_value
      );
      let total_after_tax = POUtils.getTotalAfterTax(
        untaxed_amount,
        trade_discount_amount,
        tax_lines
      );
      let payment_discount_amount = POUtils.getTotalDiscount(
        total_after_tax,
        payment_discount_rate,
        payment_discount_value
      );
      let total = POUtils.getTotalPayment(
        untaxed_amount,
        trade_discount_amount,
        payment_discount_amount,
        total_cost_line,
        tax_lines
      );
      formMain.setFieldsValue({
        line_items: [...data],
        tax_lines: tax_lines,
        total: total,
        payment_discount_amount: payment_discount_amount,
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
  const onToggleNote = useCallback(
    (id: string, value: boolean, index: number) => {
      let data: Array<PurchaseOrderLineItem> = formMain.getFieldValue(
        POField.line_items
      );
      data[index].showNote = value;
      formMain.setFieldsValue({
        line_items: [...data],
      });
      if (value) {
        setTimeout(() => {
          let element: any = document.getElementById(id);
          element?.focus();
        }, 100);
      }
    },
    [formMain]
  );
  const onSearch = useCallback(
    (value: string) => {
      if (value.trim() !== "" && value.length >= 3) {
        setLoadingSearch(true);
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
            <span className="title-card">SẢN PHẨM</span>
          </div>
        }
        extra={
          <Form.Item
            noStyle
            shouldUpdate={(prev, current) => prev.status !== current.status}
          >
            {({ getFieldValue }) => {
              let status = getFieldValue(POField.status);
              return (
                <Space size={20}>
                  {/* {!isEdit && status === POStatus.DRAFT && (
                    <Checkbox
                      checked={splitLine}
                      onChange={() => setSplitLine(!splitLine)}
                    >
                      Tách dòng
                    </Checkbox>
                  )} */}

                  <span>Chính sách giá:</span>
                  {!isEdit && status === POStatus.DRAFT ? (
                    <Form.Item
                      name={POField.policy_price_code}
                      style={{ margin: "0px" }}
                    >
                      <Select
                        style={{ minWidth: 145, height: 38 }}
                        placeholder="Chính sách giá"
                      >
                        <Select.Option
                          value={AppConfig.import_price}
                          color="#222222"
                        >
                          Giá nhập
                        </Select.Option>
                      </Select>
                    </Form.Item>
                  ) : (
                    <div>
                      <span style={{ fontWeight: 700 }}>Giá nhập</span>
                      <Form.Item
                        name={POField.policy_price_code}
                        noStyle
                        hidden
                      >
                        <Input />
                      </Form.Item>
                    </div>
                  )}
                </Space>
              );
            }}
          </Form.Item>
        }
      >
        <div>
          <Form.Item
            noStyle
            shouldUpdate={(prev, current) => prev.status !== current.status}
          >
            {({ getFieldValue }) => {
              let status = getFieldValue("status");
              return (
                !isEdit &&
                status === POStatus.DRAFT && (
                  <Input.Group className="display-flex">
                    <CustomAutoComplete
                      loading={loadingSearch}
                      id="#product_search"
                      dropdownClassName="product"
                      placeholder="Tìm kiếm sản phẩm theo tên, mã SKU, mã vạch ... (F1)"
                      onSearch={onSearch}
                      dropdownMatchSelectWidth={456}
                      style={{ width: "100%" }}
                      showAdd={true}
                      textAdd="Thêm mới sản phẩm"
                      onSelect={onSelectProduct}
                      options={renderResult}
                      ref={productSearchRef}
                      onClickAddNew={() => {
                        window.open(
                          `${BASE_NAME_ROUTER}${UrlConfig.PRODUCT}/create`,
                          "_blank"
                        );
                      }}
                    />
                    <Button
                      onClick={() => setVisibleManyProduct(true)}
                      style={{ width: 132, marginLeft: 10 }}
                    >
                      Chọn nhiều
                    </Button>
                  </Input.Group>
                )
              );
            }}
          </Form.Item>
          {}

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
              let status = getFieldValue(POField.status);

              return !isEdit && status === POStatus.DRAFT ? (
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
                            let element: any =
                              document.getElementById("#product_search");
                            element?.focus();
                            const y =
                              element?.getBoundingClientRect()?.top +
                              window.pageYOffset +
                              -250;
                            window.scrollTo({ top: y, behavior: "smooth" });
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
                      ) => {
                        return (
                          <div>
                            <div>
                              <div className="product-item-sku">
                                <Link
                                  target="_blank"
                                  to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}
                                >
                                  {item.sku}
                                </Link>
                              </div>
                              <div className="product-item-name">
                                <span className="product-item-name-detail">
                                  {value}
                                </span>
                                {!item.showNote && (
                                  <Button
                                    onClick={() => {
                                      onToggleNote(
                                        `note_${item.temp_id}`,
                                        true,
                                        index
                                      );
                                    }}
                                    className={classNames(
                                      "product-item-name-note",
                                      item.note === "" && "product-item-note"
                                    )}
                                    type="link"
                                  >
                                    <i> Thêm ghi chú</i>
                                  </Button>
                                )}
                              </div>
                            </div>
                            {item.showNote && (
                              <Input
                                id={`note_${item.temp_id}`}
                                onBlur={(e) => {
                                  if (e.target.value === "") {
                                    onToggleNote(
                                      `note_${item.temp_id}`,
                                      false,
                                      index
                                    );
                                  }
                                }}
                                addonBefore={<EditOutlined />}
                                placeholder="Nhập ghi chú"
                                value={item.note}
                                className="product-item-note-input"
                                onChange={(e) =>
                                  onNoteChange(e.target.value, index)
                                }
                              />
                            )}
                          </div>
                        );
                      },
                    },
                    // {
                    //   align: "center",
                    //   title: "Đơn vị",
                    //   width: 100,
                    //   dataIndex: "unit",
                    //   render: (value) => {
                    //     let result = "---";
                    //     let index = -1;
                    //     if (product_units) {
                    //       index = product_units.findIndex(
                    //         (item) => item.value === value
                    //       );
                    //       if (index !== -1) {
                    //         result = product_units[index].name;
                    //       }
                    //     }
                    //     return result;
                    //   },
                    // },
                    {
                      title: (
                        <div
                          style={{
                            width: "100%",
                            textAlign: "right",
                            flexDirection: "column",
                            display: "flex",
                            padding: "7px 14px",
                          }}
                        >
                          SL
                          <div
                            style={{ color: "#2A2A86", fontWeight: "normal" }}
                          >
                            ({formatCurrency(POUtils.totalQuantity(items),".")})
                          </div>
                        </div>
                      ),
                      width: 100,
                      dataIndex: "quantity",
                      render: (value, item, index) => (
                        <NumberInput
                          isFloat={false}
                          value={value}
                          min={1}
                          default={1}
                          maxLength={6}
                          onChange={(quantity) => {
                            onQuantityChange(quantity, index);
                          }}
                        />
                      ),
                    },
                    {
                      title: (
                        <div
                          style={{
                            width: "100%",
                            textAlign: "right",
                            padding: "7px 14px",
                          }}
                        >
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
                        // let type = "percent";
                        // if (item.discount_value !== null) {
                        //   type = "money";
                        // }
                        return (
                          <NumberInput
                            // style={{ width: "70%" }}
                            className="hide-number-handle"
                            min={0}
                            format={(a: string) => formatCurrency(a ? a : 0)}
                            replace={(a: string) => replaceFormatString(a)}
                            value={value}
                            onChange={(inputValue) => {
                              if (inputValue === null) {
                                onPriceChange(
                                  0,
                                  DiscountType.money,
                                  0,
                                  index
                                );
                                return;
                              }
                              onPriceChange(
                                inputValue,
                                DiscountType.money,
                                0,
                                index
                              );
                            }}
                          />
                        );
                      },
                    },
                    {
                      title: (
                        <div
                          style={{
                            width: "100%",
                            textAlign: "right",
                            padding: "7px 14px",
                          }}
                        >
                          VAT
                        </div>
                      ),
                      width: 90,
                      dataIndex: "tax_rate",
                      render: (value, item, index) => {
                        return (
                          <NumberInput
                            className="product-item-vat"
                            value={value}
                            prefix={<div>%</div>}
                            isFloat
                            onChange={(v) => onTaxChange(v, index)}
                            min={0}
                            maxLength={3}
                            max={100}
                            onBlur={() => {
                              if (value === null) {
                                onTaxChange(0, index);
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
                          <div
                            style={{
                              width: "100%",
                              textAlign: "right",
                            }}
                          >
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
                          </div>
                        </Tooltip>
                      ),
                      align: "center",
                      width: 130,
                      render: (value: number) => (
                        <div
                          style={{
                            width: "100%",
                            textAlign: "right",
                          }}
                        >
                          {formatCurrency(Math.round(value))}
                        </div>
                      ),
                    },
                    {
                      title: "",
                      fixed: items.length !== 0 && "right",
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
                />
              ) : (
                <Table
                  className="product-table"
                  rowKey={(record: PurchaseOrderLineItem) =>
                    record.id ? record.id : record.temp_id
                  }
                  rowClassName="product-table-row"
                  dataSource={items}
                  tableLayout="fixed"
                  scroll={{ y: 300, x: 1000 }}
                  pagination={false}
                  columns={[
                    {
                      title: "STT",
                      align: "center",
                      fixed: "left",
                      width: 60,
                      render: (value, record, index) => index + 1,
                    },
                    {
                      title: "Ảnh",
                      width: 60,
                      fixed: "left",
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
                      className: "ant-col-info",
                      width: 250,
                      fixed: "left",
                      dataIndex: "variant",
                      render: (
                        value: string,
                        item: PurchaseOrderLineItem,
                        index: number
                      ) => {
                        return (
                          <div>
                            <div>
                              <div className="product-item-sku">
                                <Link
                                  target="_blank"
                                  to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}
                                >
                                  {item.sku}
                                </Link>
                              </div>
                              <div className="product-item-name">
                                <span className="product-item-name-detail">
                                  {value}
                                </span>                              
                              </div>
                              <div className="product-item-name">
                                <span className="product-item-name-detail">
                                  {item.note}
                                </span>                             
                              </div>
                            </div>
                          </div>
                        );
                      },
                    },
                    {
                      title: "Đơn vị",
                      align: "center",
                      width: 100,
                      render: () => "Cái",
                    },
                    {
                      title: (
                        <div
                          style={{
                            width: "100%",
                            textAlign: "right",
                            flexDirection: "column",
                            display: "flex",
                          }}
                        >
                          SL
                          <div
                            style={{ color: "#2A2A86", fontWeight: "normal" }}
                          >
                            ({formatCurrency(POUtils.totalQuantity(items),".")})
                          </div>
                        </div>
                      ),
                      width: 100,
                      dataIndex: "quantity",
                      render: (value, item, index) => (
                        <div style={{ textAlign: "right" }}>{formatCurrency(value,".")}</div>
                      ),
                    },
                    {
                      title: (
                        <div
                          style={{
                            width: "100%",
                            textAlign: "right",
                          }}
                        >
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
                        return (
                          <div
                            style={{
                              width: "100%",
                              textAlign: "right",
                            }}
                          >
                            {formatCurrency(
                              Math.round(
                                POUtils.caculatePrice(
                                  value,
                                  item.discount_rate,
                                  item.discount_value
                                )
                              )
                            )}
                          </div>
                        );
                      },
                    },
                    {
                      title: (
                        <div
                          style={{
                            width: "100%",
                            textAlign: "right",
                          }}
                        >
                          VAT (%)
                        </div>
                      ),
                      width: 120,
                      dataIndex: "tax_rate",
                      render: (value, item, index) => {
                        return (
                          <div
                            style={{
                              width: "100%",
                              textAlign: "right",
                            }}
                          >
                            {value} %
                          </div>
                        );
                      },
                    },
                    {
                      dataIndex: "line_amount_after_line_discount",
                      title: (
                        <Tooltip title="Thành tiền không bao gồm thuế VAT">
                          <div
                            style={{
                              width: "100%",
                              textAlign: "right",
                            }}
                          >
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
                          </div>
                        </Tooltip>
                      ),
                      align: "center",
                      width: 130,
                      render: (value: number) => (
                        <div
                          style={{
                            width: "100%",
                            textAlign: "right",
                          }}
                        >
                          {formatCurrency(Math.round(value))}
                        </div>
                      ),
                    },
                    {
                      title: "",
                      width: 40,
                      render: (value: string, item, index: number) => "",
                    },
                  ]}
                />
              );
            }}
          </Form.Item>
          <Row gutter={24}>
            <Col span={12} />
            <Col span={12}>
              <Form.Item
                shouldUpdate={(prevValues, curValues) =>
                  prevValues[POField.untaxed_amount] !==
                  curValues[POField.untaxed_amount]
                }
                noStyle
              >
                {({ getFieldValue }) => {
                  let untaxed_amount = getFieldValue(POField.untaxed_amount);
                  return (
                    <div className="po-payment-row">
                      <div>Tổng tiền</div>
                      <div className="po-payment-row-result">
                        {untaxed_amount === 0
                          ? "-"
                          : formatCurrency(Math.round(untaxed_amount))}
                      </div>
                    </div>
                  );
                }}
              </Form.Item>
              <Form.Item name={POField.untaxed_amount} hidden noStyle>
                <Input />
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
              {/* <Form.Item
                shouldUpdate={(prevValues, curValues) =>
                  prevValues.trade_discount_amount !==
                  curValues.trade_discount_amount
                }
                noStyle
              >
                {({ getFieldValue }) => {
                  let untaxed_amount = getFieldValue(POField.untaxed_amount);
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
                    <div className="po-payment-row">
                      {isEdit ? (
                        <Typography.Link
                          style={{
                            textDecoration: "underline",
                            textDecorationColor: "#5D5D8A",
                            color: "#5D5D8A",
                            cursor: "default",
                          }}
                        >
                          Chiết khấu thương mại
                        </Typography.Link>
                      ) : (
                        <Popover
                          trigger="click"
                          content={
                            <DiscountModal
                              price={untaxed_amount}
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
                      )}

                      <div className="po-payment-row-result po-payment-row-result-discount">
                        {trade_discount_amount === 0
                          ? "-"
                          : formatCurrency(Math.round(trade_discount_amount))}
                      </div>
                    </div>
                  );
                }}
              </Form.Item> */}
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
                  prevValues.tax_lines !== curValues.tax_lines
                }
                noStyle
              >
                {({ getFieldValue }) => {
                  let tax_lines = getFieldValue("tax_lines");
                  return tax_lines.map((item: Vat) => (
                    <div className="po-payment-row">
                      <div>{`VAT (${item.rate}%)`}</div>
                      <div className="po-payment-row-result">
                        {formatCurrency(Math.round(item.amount))}
                      </div>
                    </div>
                  ));
                }}
              </Form.Item>
              {/* <Form.Item
                shouldUpdate={(prevValues, curValues) =>
                  prevValues[POField.payment_discount_amount] !==
                  curValues[POField.payment_discount_amount]
                }
                noStyle
              >
                {({ getFieldValue }) => {
                  let untaxed_amount = getFieldValue(POField.untaxed_amount);
                  let trade_discount_amount = getFieldValue(
                    POField.trade_discount_amount
                  );
                  let tax_lines = getFieldValue(POField.tax_lines);
                  let total_after_tax = POUtils.getTotalAfterTax(
                    untaxed_amount,
                    trade_discount_amount,
                    tax_lines
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
                    <div className="po-payment-row">
                      {isEdit ? (
                        <Typography.Link
                          style={{
                            textDecoration: "underline",
                            textDecorationColor: "#5D5D8A",
                            color: "#5D5D8A",
                            cursor: "default",
                          }}
                        >
                          Chiết khấu thanh toán
                        </Typography.Link>
                      ) : (
                        <Popover
                          trigger="click"
                          content={
                            <DiscountModal
                              price={total_after_tax}
                              discount={
                                type === "money"
                                  ? discount_value
                                  : discount_rate
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
                      )}

                      <div className="po-payment-row-result po-payment-row-result-discount">
                        {payment_discount_amount === 0
                          ? "-"
                          : formatCurrency(Math.round(payment_discount_amount))}
                      </div>
                    </div>
                  );
                }}
              </Form.Item> */}

              {/* <Form.Item
                shouldUpdate={(prevValues, curValues) =>
                  prevValues[POField.total_cost_line] !==
                  curValues[POField.total_cost_line]
                }
                noStyle
              >
                {({ getFieldValue }) => {
                  let cost_lines = getFieldValue(POField.cost_lines);
                  let total_cost_line = getFieldValue(POField.total_cost_line);
                  return (
                    <div className="po-payment-row">
                      <Typography.Link
                        onClick={() => {
                          if (!isEdit) {
                            setCostLines(cost_lines);
                            setVisibleExpense(true);
                          }
                        }}
                        style={{
                          textDecoration: "underline",
                          textDecorationColor: "#5D5D8A",
                          color: "#5D5D8A",
                          cursor: isEdit ? "default" : "pointer",
                        }}
                      >
                        Chi phí
                      </Typography.Link>
                      <div className="po-payment-row-result">
                        {total_cost_line === 0
                          ? "-"
                          : formatCurrency(total_cost_line)}
                      </div>
                    </div>
                  );
                }}
              </Form.Item> */}
              <Divider style={{marginTop: 5, marginBottom: 10}} />
              <Form.Item name={POField.cost_lines} hidden noStyle>
                <Input />
              </Form.Item>
              <Form.Item name={POField.total_cost_line} hidden noStyle>
                <Input />
              </Form.Item>
              <Form.Item name={POField.total} hidden noStyle>
                <Input />
              </Form.Item>
              <Form.Item name={POField.tax_lines} hidden noStyle>
                <Input />
              </Form.Item>
              <Form.Item
                shouldUpdate={(prevValues, curValues) =>
                  prevValues[POField.total] !== curValues[POField.total]
                }
                noStyle
              >
                {({ getFieldValue }) => {
                  let total = getFieldValue(POField.total);
                  return (
                    <div className="po-payment-row">
                      <strong className="po-payment-row-title">
                        Tiền cần trả
                      </strong>
                      <strong className="po-payment-row-success">
                        {formatCurrency(Math.round(total))}
                      </strong>
                    </div>
                  );
                }}
              </Form.Item>
            </Col>
          </Row>
        </div>
      </Card>
      {/* <ExpenseModal
        visible={visibleExpense}
        onCancel={() => setVisibleExpense(false)}
        onOk={onOkExpense}
        costLines={costLines}
      /> */}
      <PickManyProductModal
        onSave={onPickManyProduct}
        selected={[]}
        onCancel={() => setVisibleManyProduct(false)}
        visible={visibleManyProduct}
      />
    </React.Fragment>
  );
};

export default POProductForm;
