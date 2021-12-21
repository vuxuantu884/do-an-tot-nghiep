import {
  Card, Checkbox, Col, DatePicker, Divider, Form, FormInstance, Input, Row, Select, Space, Table,
  Tooltip
} from "antd";
import imgDefIcon from "assets/img/img-def.svg";
import NumberInput from "component/custom/number-input.custom";
import { StoreResponse } from "model/core/store.model";
import { POField } from "model/purchase-order/po-field";
import {
  PurchaseOrderLineReturnItem,
  Vat
} from "model/purchase-order/purchase-item.model";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { POProcumentField } from "model/purchase-order/purchase-procument";
import { RootReducerType } from "model/reducers/RootReducerType";
import moment from "moment";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { POUtils } from "utils/POUtils";
import EmptyPlaceholder from "./EmptyPlaceholder";
import POProgressView from "./po-progress-view";
import "./po-return-form.scss";

type POReturnFormProps = {
  formMain: FormInstance;
  totalReturn: number;
  totalVat: number;
  listStore: Array<StoreResponse>;
  poData:  PurchaseOrder;
};
const POReturnForm: React.FC<POReturnFormProps> = (
  props: POReturnFormProps
) => {
  const { formMain, totalReturn, totalVat, listStore, poData } = props;

  let [currentLineReturn, setCurrentLineReturn] = useState<
    Array<PurchaseOrderLineReturnItem>
  >([]);
  const product_units = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.product_unit
  );
  const handleChangeReturnQuantity = (
    value: number,
    item: PurchaseOrderLineReturnItem,
    index: number
  ) => {
    item.quantity_return = value;
    item.amount_tax_refunds = item.quantity_return * item.price * item.tax_rate / 100;
    let valueIndex = currentLineReturn.findIndex(
      (lineItem: PurchaseOrderLineReturnItem) => lineItem.id === item.id
    );
    if (valueIndex !== -1) currentLineReturn[valueIndex] = item;
    setCurrentLineReturn([...currentLineReturn]);
  };
  const handleChangeReturnPrice = (
    value: number,
    item: PurchaseOrderLineReturnItem,
    index: number
  ) => {
    item.price = value;
    item.amount_tax_refunds = item.quantity_return * item.price * item.tax_rate / 100;
    let valueIndex = currentLineReturn.findIndex(
      (lineItem: PurchaseOrderLineReturnItem) => lineItem.id === item.id
    );
    if (valueIndex !== -1) currentLineReturn[valueIndex] = item;
    setCurrentLineReturn([...currentLineReturn]);
  };

  const fillAllLineReturn = (isFill: boolean) => {
    currentLineReturn = formMain
      .getFieldValue(POField.line_items)
      .map((item: PurchaseOrderLineReturnItem) => {
        if (isFill) item.quantity_return = item.receipt_quantity;
        else item.quantity_return = 0;
        return item;
      });
    setCurrentLineReturn(currentLineReturn);
  };

  const vatLine = useMemo(() => {
    let vats: Array<Vat> = [];
    console.log(currentLineReturn);
    currentLineReturn.forEach((item) => {
      let index = vats.findIndex((item1) => item.tax_rate === item1.rate);
      if (index === -1) {
        if (item.tax_rate > 0) {
          vats.push({
            rate: item.tax_rate,
            amount: item.amount_tax_refunds ? item.amount_tax_refunds : 0,
          });
        }
      } else {
        vats[index].amount =
          vats[index].amount + item.amount_tax_refunds ? item.amount_tax_refunds : 0;
      }
    });
    console.log(vats);
    return vats;
  }, [currentLineReturn]);

  const returnedItemRef = useRef<Map<number, number>>(new Map());
  useEffect(() => {
    if(poData)
    poData?.return_orders?.forEach((item) => {
      item?.line_return_items?.forEach((lineItemReturn) => {
        const currentItem = returnedItemRef.current.get(lineItemReturn.variant_id);
        if (currentItem) {
          returnedItemRef.current.set(
            lineItemReturn.variant_id,
            lineItemReturn.quantity_return + currentItem
          );
        } else {
          returnedItemRef.current.set(
            lineItemReturn.variant_id,
            lineItemReturn.quantity_return
          );
        }
      });
    });
  }, [poData]);

  useEffect(() => {
    let allLineReturn = formMain.getFieldValue(POField.line_items);
    setCurrentLineReturn([...allLineReturn]);
  }, [formMain]);
  useEffect(() => {
    formMain.setFieldsValue({
      [POField.line_return_items]: [...currentLineReturn],
    });
  }, [currentLineReturn, formMain]);

  return (
    <Card
      className="po-form margin-top-20"
      title={
        <div className="d-flex">
          <span className="title-card">Sản phẩm</span>
        </div>
      }
    >
      <div>
        <Form.Item
          shouldUpdate={(prevValues, curValues) =>
            prevValues.receipt_quantity !== curValues.receipt_quantity ||
            prevValues.planned_quantity !== curValues.planned_quantity ||
            prevValues[POField.line_items] !== curValues[POField.line_items] ||
            prevValues[POField.line_return_items] !==
              curValues[POField.line_return_items] ||
            prevValues.expected_store !== curValues.expected_store ||
            prevValues.expect_import_date !== curValues.expect_import_date
          }
        >
          {({ getFieldValue }) => {
            const receipt_quantity = getFieldValue("receipt_quantity");
            if (receipt_quantity && receipt_quantity > 0) {
              return (
                <Fragment>
                  <Form.Item
                    shouldUpdate={(prevValues, curValues) =>
                      prevValues.expected_store !== curValues.expected_store ||
                      prevValues.expect_import_date !==
                        curValues.expect_import_date ||
                      prevValues.receipt_quantity !==
                        curValues.receipt_quantity ||
                      prevValues.planned_quantity !== curValues.planned_quantity
                    }
                  >
                    {({ getFieldValue }) => {
                      // const expected_store = getFieldValue(
                      //   POField.expect_store
                      // );
                      const receipt_quantity = getFieldValue(
                        POField.receipt_quantity
                      );
                      const planned_quantity = getFieldValue(
                        POField.planned_quantity
                      );
                      return (
                        <Fragment>
                          <Row gutter={50}>
                          <Col span={24} md={12}>
                              <Form.Item
                                name={POProcumentField.store_id}
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng chọn kho nhận hàng",
                                  },
                                ]}
                                label="Kho trả hàng"
                              >
                                <Select
                                  showSearch
                                  showArrow
                                  optionFilterProp="children"
                                  placeholder="Chọn kho"
                                >
                                  <Select.Option value="">
                                    Chọn kho trả hàng
                                  </Select.Option>
                                  {listStore.map((item) => (
                                    <Select.Option
                                      key={item.id}
                                      value={item.id}
                                    >
                                      {item.name}
                                    </Select.Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span={24} md={12}>
                              <Form.Item
                                name={POProcumentField.expect_receipt_date}
                                label={"Ngày trả hàng"}
                                rules={[{ required: true, message: "Vui lòng chọn ngày nhận" }]}
                              >
                                <DatePicker
                                  style={{ width: "100%" }}
                                  placeholder="Chọn ngày nhận"
                                  disabledDate={(current: any) =>
                                    moment().add(-1, "days") >= current
                                  }
                                  format={"DD/MM/YYYY"}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                          <POProgressView
                            remainTitle={"SL CÒN LẠI"}
                            receivedTitle={"ĐÃ NHẬN"}
                            received={receipt_quantity}
                            total={planned_quantity}
                          />
                        </Fragment>
                      );
                    }}
                  </Form.Item>
                  <Fragment />
                  <Form.Item name={POField.line_return_items} hidden />
                  <Checkbox
                    // checked={allChecked}
                    onChange={(e) => fillAllLineReturn(e.target.checked)}
                  >
                    Trả toàn bộ sản phẩm
                  </Checkbox>
                  <Form.Item
                    style={{ padding: 0 }}
                    className="margin-top-20"
                    shouldUpdate={(prevValues, curValues) => {
                      return (
                        prevValues[POField.line_items] !==
                          curValues[POField.line_items] ||
                        prevValues[POField.line_return_items] !==
                          curValues[POField.line_return_items]
                      );
                    }}
                  >
                    {({ getFieldValue }) => {
                      let items = getFieldValue(POField.line_items)
                        ? getFieldValue(POField.line_items)
                        : [];
                      return (
                        <Table
                          className="product-table"
                          rowKey={(record: PurchaseOrderLineReturnItem) =>
                            record.id ? record.id : record.temp_id
                          }
                          rowClassName="product-table-row"
                          dataSource={items}
                          tableLayout="fixed"
                          scroll={{y: 300, x: 950}}
                          pagination={false}
                          columns={[
                            {
                              title: "STT",
                              align: "center",
                              width: 40,
                              fixed: "left",
                              render: (value, record, index) => index + 1,
                            },
                            {
                              title: "Ảnh",
                              width: 40,
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
                              fixed: "left",
                              width: 150,
                              className: "ant-col-info",
                              dataIndex: "variant",
                              render: (
                                value: string,
                                item: PurchaseOrderLineReturnItem,
                                index: number
                              ) => (
                                <div>
                                  <div>
                                    <div className="product-item-sku">{item.sku}</div>
                                    <div className="product-item-name">
                                      <span className="product-item-name-detail">
                                        {value}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ),
                            },
                            {
                              title: <div className="margin-left-4">Đơn vị</div>,
                              width: 60,
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
                                return <div className="margin-left-4">{result}</div>;
                              },
                            },
                            {
                              title: (
                                <div
                                  style={{
                                    width: "100%",
                                    textAlign: "left",
                                    flexDirection: "row",
                                    display: "flex",
                                  }}
                                >
                                  Số lượng
                                  <div
                                    style={{
                                      color: "#2A2A86",
                                      fontWeight: "normal",
                                      marginLeft: 4,
                                    }}
                                  >
                                    ({POUtils.totalReceipt(items)})
                                  </div>
                                </div>
                              ),
                              width: 100,
                              dataIndex: "receipt_quantity",
                              render: (value, item, index) => {
                                let currentValue = 0;
                                let numberCanReturn = 0;
                                if (currentLineReturn.length > 0) {
                                  let valueIndex = currentLineReturn.findIndex(
                                    (lineItem: PurchaseOrderLineReturnItem) =>
                                      lineItem.id === item.id
                                  );
                                  if (valueIndex !== -1) {
                                    let currentItem = currentLineReturn[valueIndex];
                                    currentValue = currentItem.quantity_return;
                                    const currentReturnedQty =
                                      returnedItemRef.current.get(currentItem.variant_id);
                                    if (typeof currentReturnedQty === "number") {
                                      numberCanReturn = value - currentReturnedQty;
                                    } else {
                                      numberCanReturn = value;
                                    }
                                  }
                                }
                                return (
                                  <div
                                    style={{
                                      display: "flex",
                                      textAlign: "right",
                                      flexDirection: "row",
                                      width: "100%",
                                    }}
                                  >
                                    <NumberInput
                                      style={{
                                        width: "50%",
                                      }}
                                      className="hide-number-handle"
                                      max={numberCanReturn}
                                      min={0}
                                      value={currentValue}
                                      default={0}
                                      onChange={(inputValue) => {
                                        if (inputValue === null) return;
                                        handleChangeReturnQuantity(
                                          inputValue,
                                          item,
                                          index
                                        );
                                      }}
                                    />{" "}
                                    <span
                                      style={{
                                        marginLeft: 4,
                                        display: "inline-flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      /{numberCanReturn}
                                    </span>
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
                                  Giá nhập hàng trả
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
                                let currentValue = 0;
                                if (currentLineReturn.length > 0) {
                                  let valueIndex = currentLineReturn.findIndex(
                                    (lineItem: PurchaseOrderLineReturnItem) =>
                                      lineItem.id === item.id
                                  );
                                  if (valueIndex !== -1) {
                                    currentValue = currentLineReturn[valueIndex].price;
                                  }
                                }
                                return (
                                  <div
                                    style={{
                                      width: "100%",
                                      textAlign: "right",
                                    }}
                                  >
                                    <NumberInput
                                      style={{width: "70%"}}
                                      className="hide-number-handle"
                                      min={0}
                                      format={(a: string) =>
                                        formatCurrency(
                                          a
                                            ? Math.round(
                                                POUtils.caculatePrice(
                                                  parseInt(a),
                                                  item.discount_rate,
                                                  item.discount_value
                                                )
                                              )
                                            : 0
                                        )
                                      }
                                      replace={(a: string) => replaceFormatString(a)}
                                      value={currentValue}
                                      default={currentValue}
                                      onChange={(inputValue) => {
                                        if (inputValue === null) return;
                                        handleChangeReturnPrice(inputValue, item, index);
                                      }}
                                    />
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
                                  VAT
                                </div>
                              ),
                              width: 90,
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
                              render: (item) => {
                                let displayValue = 0;
                                if (item.quantity_return) {
                                  displayValue = Math.round(
                                    item.quantity_return *
                                      POUtils.caculatePrice(
                                        item.price,
                                        item.discount_rate,
                                        item.discount_value
                                      )
                                  );
                                }
                                return (
                                  <div
                                    style={{
                                      width: "100%",
                                      textAlign: "right",
                                    }}
                                  >
                                    {formatCurrency(displayValue)}
                                  </div>
                                );
                              },
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
                  <Row>
                    <Col span={16}>
                      <Form.Item name={POField.return_reason} rules={[{
                        required: true,
                        message: "Vui lòng nhập lý do"
                      }]}
                      label="Lý do hoàn trả:"
                      >
                        <Input.TextArea
                          size="large"
                          placeholder="Nhập lý do..."
                          maxLength={255}
                          style={{ marginTop: 10, height: 150, width: "80%" }}
                        />
                      </Form.Item>
                    </Col>
                    <Col
                      span={8}
                      style={{ display: "flex", flexDirection: "column" }}
                    >
                      <Fragment>
                        <Space
                          size="large"
                          style={{ flex: 1 }}
                          direction="vertical"
                        >
                          <div className="po-payment-row">
                            <div>Tổng tiền:</div>
                            <div className="po-payment-row-result">
                              {formatCurrency(totalReturn)}
                            </div>
                          </div>
                          {vatLine.map((item: Vat) => {
                            return (
                              <div className="po-payment-row">
                                <div>{`VAT (${item.rate}%):`}</div>
                                <div className="po-payment-row-result">
                                  {formatCurrency(Math.round(item.amount))}
                                </div>
                              </div>
                            );
                          })}
                        </Space>

                        <Divider />
                        <div className="po-payment-row">
                          <div>
                            <strong>Tổng giá trị trả hàng:</strong>
                          </div>
                          <div
                            className="po-payment-row-result"
                            style={{ color: "#2A2A86", fontSize: 16 }}
                          >
                            {formatCurrency(totalReturn + totalVat)}
                          </div>
                        </div>
                      </Fragment>
                    </Col>
                  </Row>
                </Fragment>
              );
            } else
              return <EmptyPlaceholder text="Không có sản phẩm để hoàn trả" />;
          }}
        </Form.Item>
      </div>
    </Card>
  );
};
export default POReturnForm;
