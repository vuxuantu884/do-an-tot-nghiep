import { Checkbox, Col, DatePicker, Divider, Form, FormInstance, Input, Row, Select, Table, Tooltip } from "antd";
import imgDefIcon from "assets/img/img-def.svg";
import NumberInput from "component/custom/number-input.custom";
import { StoreResponse } from "model/core/store.model";
import { POField } from "model/purchase-order/po-field";
import { PurchaseOrderLineReturnItem, Vat } from "model/purchase-order/purchase-item.model";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { POProcumentField } from "model/purchase-order/purchase-procument";
import { RootReducerType } from "model/reducers/RootReducerType";
import moment from "moment";
import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { POUtils } from "utils/POUtils";
import { fullTextSearch } from "utils/StringUtils";
import EmptyPlaceholder from "./EmptyPlaceholder";
import POProgressView from "./po-progress-view";
import "./po-return-form.scss";
import POSupplierForm from "./po-supplier-form";
import { CountryResponse } from "model/content/country.model";
import { DistrictResponse } from "model/content/district.model";

type POReturnFormProps = {
  type: string,
  formMain: FormInstance;
  totalReturn: number;
  totalVat: number;
  listStore: Array<StoreResponse>;
  poData: PurchaseOrder;
  listCountries: Array<CountryResponse>;
  listDistrict: Array<DistrictResponse>;
};
const POReturnForm: React.FC<POReturnFormProps> = (props: POReturnFormProps) => {
  const { formMain, totalReturn, totalVat, listStore, poData, listCountries, listDistrict, type } = props;

  let [currentLineReturn, setCurrentLineReturn] = useState<any>([]);
  const product_units = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.product_unit,
  );
  const handleChangeReturnQuantity = (
    value: number | null,
    item: PurchaseOrderLineReturnItem,
  ) => {
    item.quantity_return = value || 0;
    item.amount_tax_refunds = (Number(item.quantity_return) * item.price * item.tax_rate) / 100;
    let valueIndex = currentLineReturn.findIndex(
      (lineItem: PurchaseOrderLineReturnItem) => lineItem.id === item.id,
    );
    if (valueIndex !== -1) currentLineReturn[valueIndex] = item;
    setCurrentLineReturn([...currentLineReturn]);
  };
  const handleChangeReturnPrice = (
    value: number,
    item: PurchaseOrderLineReturnItem,
  ) => {
    item.price = value;
    item.amount_tax_refunds = (item.quantity_return * item.price * item.tax_rate) / 100;
    let valueIndex = currentLineReturn.findIndex(
      (lineItem: PurchaseOrderLineReturnItem) => lineItem.id === item.id,
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
    const vats: Array<Vat> = [];
    currentLineReturn.forEach((item: any) => {
      let index = vats.findIndex((item1) => item.tax_rate === item1.rate);
      if (index === -1) {
        if (item.tax_rate > 0) {
          const vat: Vat = {
            rate: item.tax_rate,
            amount: Number(item.amount_tax_refunds) || 0,
          };
          vats.push(vat);
        }
      } else {
        vats[index] = {
          rate: item.tax_rate,
          amount: vats[index].amount + (Number(item.amount_tax_refunds) || 0),
        };
      }
    });
    if (!vats.length) {
      vats.push({
        rate: 0,
        amount: 0,
      });
    }
    return vats;
  }, [currentLineReturn]);

  const returnedItemRef = useRef<Map<number, number>>(new Map());
  useEffect(() => {
    if (poData)
      poData?.return_orders?.forEach((item) => {
        item?.line_return_items?.forEach((lineItemReturn) => {
          const currentItem = returnedItemRef.current.get(lineItemReturn.variant_id);
          if (currentItem) {
            returnedItemRef.current.set(
              lineItemReturn.variant_id,
              lineItemReturn.quantity_return + currentItem,
            );
          } else {
            returnedItemRef.current.set(lineItemReturn.variant_id, lineItemReturn.quantity_return);
          }
        });
      });
  }, [poData]);

  useEffect(() => {
    setCurrentLineReturn(poData.line_items);
  }, []);

  useEffect(() => {
    formMain.setFieldsValue({
      [POField.line_return_items]: [...currentLineReturn],
    });
  }, [currentLineReturn, formMain]);

  return (
    <div>
      <POSupplierForm
        type="RETURN"
        showSupplierAddress={true}
        showBillingAddress={false}
        isEdit={true}
        hideExpand={true}
        listCountries={listCountries}
        listDistrict={listDistrict}
        formMain={formMain}
      />
      <Form.Item
        shouldUpdate={(prevValues, curValues) =>
          prevValues.receipt_quantity !== curValues.receipt_quantity ||
          prevValues.planned_quantity !== curValues.planned_quantity ||
          prevValues[POField.line_items] !== curValues[POField.line_items] ||
          prevValues[POField.line_return_items] !== curValues[POField.line_return_items] ||
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
                    prevValues.expect_import_date !== curValues.expect_import_date ||
                    prevValues.receipt_quantity !== curValues.receipt_quantity ||
                    prevValues.planned_quantity !== curValues.planned_quantity
                  }
                >
                  {({ getFieldValue }) => {
                    // const expected_store = getFieldValue(
                    //   POField.expect_store
                    // );
                    const receipt_quantity = getFieldValue(POField.receipt_quantity);
                    const planned_quantity = getFieldValue(POField.planned_quantity);
                    return (
                      <Fragment>
                        <Row gutter={50} className="margin-top-20">
                          <Col span={24} md={8}>
                            <Row>
                              <Col span={12} md={8}>
                                <div style={{ marginTop: 5 }} className="label">Kho trả hàng:</div>
                              </Col>
                              <Col span={12} md={16}>
                                <Form.Item
                                  name={POProcumentField.store_id}
                                  rules={[
                                    {
                                      required: true,
                                      message: "Vui lòng chọn kho trả hàng",
                                    },
                                  ]}
                                >
                                  <Select
                                    autoClearSearchValue={false}
                                    showSearch
                                    showArrow
                                    optionFilterProp="children"
                                    placeholder="Chọn kho"
                                    allowClear
                                    filterOption={(input, option) =>
                                      fullTextSearch(input, option?.children)
                                    }
                                  >
                                    {listStore.map((item) => (
                                      <Select.Option key={item.id} value={item.id}>
                                        {item.name}
                                      </Select.Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                              </Col>
                            </Row>
                          </Col>
                          <Col span={24} md={8}>
                            <Row>
                              <Col span={24} md={8}>
                                <div style={{ marginTop: 8 }} className="label">
                                  Ngày trả hàng:
                                </div>
                              </Col>
                              <Col span={24} md={16}>
                                <Form.Item
                                  name={POProcumentField.expect_receipt_date}
                                  rules={[
                                    {
                                      required: true,
                                      message: "Vui lòng chọn ngày trả hàng",
                                    },
                                  ]}
                                >
                                  <DatePicker
                                    style={{ width: "100%" }}
                                    placeholder="Chọn ngày trả hàng"
                                    disabledDate={(current: any) =>
                                      moment().add(-1, "days") >= current
                                    }
                                    format={"DD/MM/YYYY"}
                                  />
                                </Form.Item>
                              </Col>
                            </Row>
                          </Col>
                          <Col span={24} md={8} style={{ textAlign: "right" }}>
                            <Checkbox
                              className="mt-10"
                              // checked={allChecked}
                              onChange={(e) => fillAllLineReturn(e.target.checked)}
                            >
                              Trả toàn bộ sản phẩm
                            </Checkbox>
                          </Col>
                        </Row>
                        {type !== "RETURN" && (
                          <POProgressView
                            remainTitle={"SL CÒN LẠI"}
                            receivedTitle={"ĐÃ NHẬN"}
                            received={receipt_quantity}
                            total={planned_quantity}
                          />
                        )}
                      </Fragment>
                    );
                  }}
                </Form.Item>
                <Fragment />
                <Form.Item name={POField.line_return_items} hidden />
                <Form.Item
                  style={{ padding: 0 }}
                  shouldUpdate={(prevValues, curValues) => {
                    return (
                      prevValues[POField.line_items] !== curValues[POField.line_items] ||
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
                        scroll={{ y: 300, x: 950 }}
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
                            ) => (
                              <div>
                                <div>
                                  <div className="product-item-sku">{item.sku}</div>
                                  <div className="product-item-name product-item-name">
                                    <div className="product-item-name-detail">{value}</div>
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
                                index = product_units.findIndex((item) => item.value === value);
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
                                  ({formatCurrency(POUtils.totalReceipt(items))})
                                </div>
                              </div>
                            ),
                            width: 100,
                            dataIndex: "receipt_quantity",
                            render: (value, item) => {
                              let currentValue = 0;
                              let numberCanReturn = 0;
                              if (currentLineReturn.length > 0) {
                                let valueIndex = currentLineReturn.findIndex(
                                  (lineItem: PurchaseOrderLineReturnItem) =>
                                    lineItem.id === item.id,
                                );
                                if (valueIndex !== -1) {
                                  let currentItem = currentLineReturn[valueIndex];
                                  currentValue = currentItem.quantity_return;
                                  const currentReturnedQty = returnedItemRef.current.get(
                                    currentItem.variant_id,
                                  );
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
                                    min={0}
                                    value={currentValue}
                                    default={0}
                                    onChange={(inputValue) => {
                                      handleChangeReturnQuantity(inputValue, item);
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
                            render: (value, item) => {
                              let currentValue = 0;
                              if (currentLineReturn.length > 0) {
                                let valueIndex = currentLineReturn.findIndex(
                                  (lineItem: PurchaseOrderLineReturnItem) =>
                                    lineItem.id === item.id,
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
                                    style={{ width: "70%" }}
                                    className="hide-number-handle"
                                    min={0}
                                    format={(a: string) =>
                                      formatCurrency(
                                        a
                                          ? Math.round(
                                            POUtils.caculatePrice(
                                              parseInt(a),
                                              item.discount_rate,
                                              item.discount_value,
                                            ),
                                          )
                                          : 0,
                                      )
                                    }
                                    replace={(a: string) => replaceFormatString(a)}
                                    value={currentValue}
                                    default={currentValue}
                                    onChange={(inputValue) => {
                                      if (inputValue === null) return;
                                      handleChangeReturnPrice(inputValue, item);
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
                            render: (value) => {
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
                                    item.discount_value,
                                  ),
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
                            render: () => "",
                          },
                        ]}
                      />
                    );
                  }}
                </Form.Item>
                <Row gutter={50}>
                  <Col span={16}>
                    <Form.Item
                      name={POField.return_reason}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập lý do",
                        },
                      ]}
                      label="Lý do hoàn trả:"
                    >
                      <Input.TextArea
                        size="large"
                        placeholder="Nhập lý do..."
                        maxLength={255}
                        style={{ marginTop: 10, height: 75, width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8} style={{ display: "flex", flexDirection: "column" }}>
                    <Fragment>
                      <div className="po-payment-row">
                        <div>Tổng tiền:</div>
                        <div className="po-payment-row-result">
                          {formatCurrency(totalReturn)}
                        </div>
                      </div>
                      {vatLine.map((item: Vat, index: number) => {
                        return (
                          <div className="po-payment-row" key={index}>
                            <div>
                              VAT
                              <span className="po-payment-row-error">{` (${item.rate}%):`}</span>
                            </div>
                            <div className="po-payment-row-result">
                              {formatCurrency(Math.round(item.amount))}
                            </div>
                          </div>
                        );
                      })}

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
          } else return <EmptyPlaceholder text="Không có sản phẩm để hoàn trả" />;
        }}
      </Form.Item>
    </div>
  );
};
export default POReturnForm;
