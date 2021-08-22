import {
  Card,
  Row,
  Col,
  Space,
  Form,
  Table,
  Tooltip,
  Divider,
  InputNumber,
  Input,
  FormInstance,
} from "antd";
import { POField } from "model/purchase-order/po-field";
import { Fragment, useMemo } from "react";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import POProgressView from "./po-progress-view";
import {
  PurchaseOrderLineReturnItem,
  Vat,
} from "model/purchase-order/purchase-item.model";
import imgDefIcon from "assets/img/img-def.svg";
import { RootReducerType } from "model/reducers/RootReducerType";
import { POUtils } from "utils/POUtils";
import { formatCurrency } from "utils/AppUtils";
import { useSelector } from "react-redux";
import "./po-return-form.scss";
type POReturnFormProps = {
  formMain: FormInstance;
};

const POReturnForm: React.FC<POReturnFormProps> = (
  props: POReturnFormProps
) => {
  const { formMain } = props;
  const product_units = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.product_unit
  );
  const handleChangeReturnQuantity = (
    value: number,
    item: PurchaseOrderLineReturnItem,
    index: number
  ) => {
    item.quantity_return = value;
    let currentLineReturn = formMain.getFieldValue(POField.line_return_items);
    if (!currentLineReturn) currentLineReturn = [];
    let valueIndex = currentLineReturn.findIndex(
      (lineItem: PurchaseOrderLineReturnItem) => lineItem.id === item.id
    );
    if (valueIndex === -1) currentLineReturn.push(item);
    else currentLineReturn[valueIndex] = item;
    formMain.setFieldsValue({
      [POField.line_return_items]: [...currentLineReturn],
    });
  };

  return (
    <Card
      className="po-form margin-top-20"
      title={
        <div className="d-flex">
          <span className="title-card">Sản phẩm</span>
        </div>
      }
    >
      <div className="padding-20">
        <Form.Item
          shouldUpdate={(prevValues, curValues) =>
            prevValues.expected_store !== curValues.expected_store ||
            prevValues.expect_import_date !== curValues.expect_import_date
          }
        >
          {({ getFieldValue }) => {
            const expected_store = getFieldValue(POField.expect_store);
            const expect_import_date = getFieldValue(
              POField.expect_import_date
            );
            const receipt_quantity = getFieldValue(POField.receipt_quantity);
            const planned_quantity = getFieldValue(POField.planned_quantity);
            return (
              <Fragment>
                <Row>
                  <Space
                    direction="horizontal"
                    size="large"
                    split={<i className="icon-dot" />}
                  >
                    <div>
                      Kho nhận hàng:{" "}
                      <strong>{expected_store.toUpperCase()}</strong>
                    </div>
                    <div>
                      Ngày nhận dự kiến:{" "}
                      <strong>
                        {ConvertUtcToLocalDate(expect_import_date)}
                      </strong>
                    </div>
                  </Space>
                </Row>
                <POProgressView
                  received={receipt_quantity}
                  total={planned_quantity}
                />
              </Fragment>
            );
          }}
        </Form.Item>
        <Fragment />
        <Form.Item name={POField.line_return_items} hidden />
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
                    render: (value, item, index) => (
                      <div
                        style={{
                          display: "flex",
                          textAlign: "right",
                          flexDirection: "row",
                          width: "100%",
                        }}
                      >
                        <InputNumber
                          size="small"
                          style={{
                            width: "50%",
                          }}
                          className="hide-number-handle"
                          type="number"
                          max={value}
                          min={0}
                          defaultValue={0}
                          onFocus={(e) => e.target.select()}
                          onChange={(inputValue) => {
                            handleChangeReturnQuantity(inputValue, item, index);
                          }}
                        />{" "}
                        <span
                          style={{
                            marginLeft: 4,
                            display: "inline-flex",
                            alignItems: "center",
                          }}
                        >
                          /{value}
                        </span>
                      </div>
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
                          {displayValue}
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
            <div>
              <strong>Lý do hoàn trả:</strong>
            </div>
            <Form.Item name={POField.return_reason}>
              <Input.TextArea
                size="large"
                placeholder="Nhập lý do..."
                maxLength={255}
                style={{ marginTop: 10, height: 150, width: "80%" }}
              />
            </Form.Item>
          </Col>
          <Col span={8} style={{ display: "flex", flexDirection: "column" }}>
            <Form.Item
              shouldUpdate={(prevValues, curValues) =>
                prevValues.tax_lines !== curValues.tax_lines ||
                prevValues.line_return_items !== curValues.line_return_items
              }
              noStyle
            >
              {({ getFieldValue }) => {
                let tax_lines = getFieldValue(POField.tax_lines),
                  line_return_items = getFieldValue(POField.line_return_items);
                let totalReturn = 0,
                  totalVat = 0;
                line_return_items &&
                  line_return_items.map((item: PurchaseOrderLineReturnItem) => {
                    totalReturn +=
                      item.quantity_return *
                      POUtils.caculatePrice(
                        item.price,
                        item.discount_rate,
                        item.discount_value
                      );
                  });
                return (
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
                      {tax_lines.map((item: Vat) => {
                        totalVat += item.amount;
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
                );
              }}
            </Form.Item>
          </Col>
        </Row>
      </div>
    </Card>
  );
};
export default POReturnForm;
