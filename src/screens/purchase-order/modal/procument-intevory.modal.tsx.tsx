import { Col, Form, Input, Modal, Row, Table } from "antd";
import { StoreResponse } from "model/core/store.model";
import {
  POProcumentField,
  POProcumentLineItemField,
  PurchaseProcument,
  PurchaseProcumentLineItem,
} from "model/purchase-order/purchase-procument";
import { useCallback, useEffect, useState } from "react";
import { ProcumentStatus } from "utils/Constants";
import { ConvertDateToUtc, ConvertUtcToLocalDate } from "utils/DateUtils";
import imgDefIcon from "assets/img/img-def.svg";
import NumberInput from "component/custom/number-input.custom";
import { POUtils } from "utils/POUtils";
import { Moment } from "moment";

type ProducmentInventoryModalProps = {
  visible: boolean;
  now: Moment;
  stores: Array<StoreResponse>;
  onCancel: () => void;
  item: PurchaseProcument | null;
  defaultStore: number;
  onOk: (value: PurchaseProcument) => void;
  loading: boolean;
};

const ProducmentInventoryModal: React.FC<ProducmentInventoryModalProps> = (
  props: ProducmentInventoryModalProps
) => {
  const { visible, now, onCancel, item, defaultStore, onOk, loading } = props;
  const [code, setCode] = useState<string | undefined>("");
  const [form] = Form.useForm();
  const onFinish = useCallback(
    (value: PurchaseProcument) => {
      onOk(value);
    },
    [onOk]
  );
  const onQuantityChange = useCallback(
    (quantity, index: number) => {
      let procurement_items: Array<PurchaseProcumentLineItem> =
        form.getFieldValue(POProcumentField.procurement_items);
      procurement_items[index].real_quantity = quantity;
      form.setFieldsValue({ procurement_items: [...procurement_items] });
    },
    [form]
  );
  const onCancelClick = useCallback(() => {
    let result: PurchaseProcument = JSON.parse(JSON.stringify(item));
    form.setFieldsValue(result);
    onCancel();
  }, [form, item, onCancel]);
  useEffect(() => {
    let result: PurchaseProcument = JSON.parse(JSON.stringify(item));
    form.setFieldsValue(result);
    setCode(item?.code);
  }, [form, item]);
  return (
    <Modal
      onCancel={onCancelClick}
      width={900}
      visible={visible}
      cancelText="Hủy"
      onOk={() => {
        form.setFieldsValue({ status: ProcumentStatus.RECEIVED });
        form.submit();
      }}
      confirmLoading={loading}
      title={
        <div>
          Xác nhận nhập kho phiếu nháp{" "}
          <span style={{ color: "#2A2A86" }}>"{code}"</span>
        </div>
      }
      okText="Xác nhận nhập"
    >
      <Form
        initialValues={{
          procurement_items: [],
          store_id: defaultStore,
          status: ProcumentStatus.DRAFT,
          expect_receipt_date: ConvertDateToUtc(now),
        }}
        form={form}
        onFinishFailed={({ errorFields }: any) => {
          const element: any = document.getElementById(
            errorFields[0].name.join("")
          );
          element?.focus();
          const y =
            element?.getBoundingClientRect()?.top + window.pageYOffset + -250;
          window.scrollTo({ top: y, behavior: "smooth" });
        }}
        onFinish={onFinish}
        layout="vertical"
      >
        <Form.Item hidden noStyle name={POProcumentField.code}>
          <Input />
        </Form.Item>
        <Form.Item hidden noStyle name={POProcumentField.id}>
          <Input />
        </Form.Item>
        <Form.Item hidden noStyle name={POProcumentField.store}>
          <Input />
        </Form.Item>
        <Form.Item hidden noStyle name={POProcumentField.store_id}>
          <Input />
        </Form.Item>
        <Form.Item hidden noStyle name={POProcumentField.expect_receipt_date}>
          <Input />
        </Form.Item>
        <Row gutter={50}>
          <Col span={24} md={12}>
            <Form.Item
              shouldUpdate={(prev, current) =>
                prev[POProcumentField.store_id] !==
                current[POProcumentField.store_id]
              }
            >
              {({ getFieldValue }) => {
                let store = getFieldValue(POProcumentField.store);
                return (
                  <div>
                    Về kho: <strong>{store}</strong>
                  </div>
                );
              }}
            </Form.Item>
          </Col>
          <Col span={24} md={12}>
            <Form.Item
              shouldUpdate={(prev, current) =>
                prev[POProcumentField.expect_receipt_date] !==
                current[POProcumentField.expect_receipt_date]
              }
            >
              {({ getFieldValue }) => {
                let expect_receipt_date = getFieldValue(
                  POProcumentField.expect_receipt_date
                );
                return (
                  <div>
                    Ngày dự kiến{" "}
                    <strong>
                      {ConvertUtcToLocalDate(expect_receipt_date)}
                    </strong>
                  </div>
                );
              }}
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name={POProcumentField.procurement_items} hidden noStyle>
          <Input />
        </Form.Item>
        <Form.Item name={POProcumentField.status} hidden noStyle>
          <Input />
        </Form.Item>
        <Form.Item
          shouldUpdate={(prev, current) =>
            prev[POProcumentField.procurement_items] !==
            current[POProcumentField.procurement_items]
          }
          noStyle
        >
          {({ getFieldValue }) => {
            let line_items = getFieldValue(POProcumentField.procurement_items)
              ? getFieldValue(POProcumentField.procurement_items)
              : [];
            return (
              <Table
                className="product-table"
                rowKey={(record: PurchaseProcumentLineItem) =>
                  record.line_item_id
                }
                rowClassName="product-table-row"
                dataSource={line_items}
                tableLayout="fixed"
                scroll={{ y: 250, x: 845 }}
                pagination={false}
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
                    dataIndex: POProcumentLineItemField.variant_image,
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
                    dataIndex: POProcumentLineItemField.variant,
                    render: (
                      value: string,
                      item: PurchaseProcumentLineItem,
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
                    title: (
                      <div
                        style={{
                          width: "100%",
                          textAlign: "right",
                          flexDirection: "column",
                          display: "flex",
                        }}
                      >
                        SL Đặt hàng
                        <div style={{ color: "#2A2A86", fontWeight: "normal" }}>
                          ({POUtils.totalOrderQuantityProcument(line_items)})
                        </div>
                      </div>
                    ),
                    width: 130,
                    dataIndex: POProcumentLineItemField.ordered_quantity,
                    render: (value, item, index) => (
                      <div style={{ textAlign: "right" }}>{value}</div>
                    ),
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
                        SL nhận được duyệt
                      </div>
                    ),
                    width: 130,
                    dataIndex: POProcumentLineItemField.quantity,
                    render: (value, item, index) => (
                      <div style={{ textAlign: "right" }}>{value}</div>
                    ),
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
                        SL thực nhận
                      </div>
                    ),
                    width: 150,
                    dataIndex: POProcumentLineItemField.real_quantity,
                    render: (value, item, index) => (
                      <NumberInput
                        placeholder="Kế hoạch nhận"
                        isFloat={false}
                        value={value}
                        min={1}
                        max={item.quantity}
                        default={1}
                        maxLength={6}
                        onChange={(quantity: number | null) => {
                          onQuantityChange(quantity, index);
                        }}
                      />
                    ),
                  },
                ]}
                summary={(data) => {
                  let ordered_quantity = 0;
                  let quantity = 0;
                  let real_quantity = 0;
                  data.forEach((item) => {
                    ordered_quantity = ordered_quantity + item.ordered_quantity;
                    quantity = quantity + item.quantity;
                    real_quantity = real_quantity + item.real_quantity;
                  })
                  return (
                    <Table.Summary>
                      <Table.Summary.Row>
                        <Table.Summary.Cell
                          align="left"
                          colSpan={3}
                          index={0}
                        >
                          <div style={{ fontWeight: 700 }}>Tổng</div>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell align="right" index={1}>
                          <div style={{ fontWeight: 700 }}>
                            {ordered_quantity}
                          </div>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell align="right" index={2}>
                          <div style={{ fontWeight: 700 }}>{quantity}</div>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell align="right" index={3}>
                          <div style={{ fontWeight: 700, marginRight: 15 }}>{real_quantity}</div>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    </Table.Summary>
                  );
                }}
              />
            );
          }}
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProducmentInventoryModal;
