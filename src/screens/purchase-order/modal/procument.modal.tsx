import { Col, Form, Input, Modal, Row, Select, Table } from "antd";
import CustomDatepicker from "component/custom/date-picker.custom";
import { StoreResponse } from "model/core/store.model";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import {
  POProcumentField,
  POProcumentLineItemField,
  PurchaseProcument,
  PurchaseProcumentLineItem,
} from "model/purchase-order/purchase-procument";
import { useCallback, useEffect } from "react";
import { ProcumentStatus } from "utils/Constants";
import { ConvertDateToUtc } from "utils/DateUtils";
import { POUtils } from "utils/POUtils";
import imgDefIcon from "assets/img/img-def.svg";
import NumberInput from "component/custom/number-input.custom";

type ProcumentModalProps = {
  visible: boolean;
  now: Date;
  stores: Array<StoreResponse>;
  onCancle: () => void;
  items: Array<PurchaseOrderLineItem>;
  defaultStore: number;
  onOk: (value: PurchaseProcument) => void;
  loading: boolean;
};

const ProcumentModal: React.FC<ProcumentModalProps> = (
  props: ProcumentModalProps
) => {
  const { visible, now, stores, onCancle, items, defaultStore, onOk, loading } =
    props;
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
      procurement_items[index].quantity = quantity;
      form.setFieldsValue({ procurement_items: [...procurement_items] });
    },
    [form]
  );
  useEffect(() => {
    let result = POUtils.getPOProcumentItem(items);
    form.setFieldsValue({
      procurement_items: result,
    });
  }, [form, items]);
  return (
    <Modal
      onCancel={onCancle}
      width={900}
      visible={visible}
      cancelText="Hủy"
      onOk={() => {
        form.submit();
      }}
      confirmLoading={loading}
      title="Tạo phiếu nháp"
      okText="Tạo phiếu nháp"
    >
      <Form
        initialValues={{
          procurement_items: [],
          store_code: defaultStore,
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
        <Row gutter={50}>
          <Col span={24} md={12}>
            <Form.Item
              name={POProcumentField.store_code}
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn kho nhận hàng",
                },
              ]}
              label="Kho nhận hàng"
            >
              <Select>
                <Select.Option value="">Chọn kho nhận</Select.Option>
                {stores.map((item) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={24} md={12}>
            <Form.Item
              name={POProcumentField.expect_receipt_date}
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ngày nhận dự kiến",
                },
              ]}
              label="Ngày nhận dự kiến"
            >
              <CustomDatepicker
                disableDate={(date) => date.valueOf() < now.getTime()}
                style={{ width: "100%" }}
              />
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
                    dataIndex: POProcumentLineItemField.variant_name,
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
                          ({POUtils.totalQuantity(items)})
                        </div>
                      </div>
                    ),
                    width: 150,
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
                        SL Nhận được duyệt
                      </div>
                    ),
                    width: 150,
                    dataIndex: POProcumentLineItemField.accepted_quantity,
                    render: (value, item, index) => (
                      <div style={{ textAlign: "right" }}>
                        {value ? value : 0}
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
                        Kế hoạch nhận
                      </div>
                    ),
                    width: 150,
                    dataIndex: POProcumentLineItemField.quantity,
                    render: (value, item, index) => (
                      <NumberInput
                        placeholder="Kế hoạch nhận"
                        isFloat={false}
                        value={value}
                        min={1}
                        max={item.ordered_quantity}
                        default={1}
                        maxLength={6}
                        onChange={(quantity: number | null) => {
                          onQuantityChange(quantity, index);
                        }}
                      />
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
      </Form>
    </Modal>
  );
};

export default ProcumentModal;
