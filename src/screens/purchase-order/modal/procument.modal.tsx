import { Form, Table, Button } from "antd";
import { StoreResponse } from "model/core/store.model";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import {
  POProcumentField,
  POProcumentLineItemField,
  PurchaseProcument,
  PurchaseProcumentLineItem,
} from "model/purchase-order/purchase-procument";
import { POUtils } from "utils/POUtils";
import imgDefIcon from "assets/img/img-def.svg";
import NumberInput from "component/custom/number-input.custom";
import { Moment } from "moment";

import ProcumentCommonModal from "./procument.common.modal";

type ProcumentModalProps = {
  visible: boolean;
  now: Moment;
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
  return (
    <ProcumentCommonModal
      type="draft"
      items={items}
      onCancle={onCancle}
      now={now}
      stores={stores}
      defaultStore={defaultStore}
      visible={visible}
      cancelText="Hủy"
      onOk={onOk}
      loading={loading}
      title="Tạo phiếu nháp"
      okText="Tạo phiếu nháp"
    >
      {(onQuantityChange, onRemove, line_items) => {
        return (
          <Table
            className="product-table"
            rowKey={(record: PurchaseProcumentLineItem) => {
              return `${record.line_item_id}`;
            }}
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
                      ({POUtils.totalQuantity(items)})
                    </div>
                  </div>
                ),
                width: 120,
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
                    SL đã nhận
                  </div>
                ),
                width: 100,
                dataIndex: POProcumentLineItemField.accepted_quantity,
                render: (value, item, index) => (
                  <div style={{ textAlign: "right" }}>{value ? value : 0}</div>
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
                    SL Đã lên kế hoạch
                  </div>
                ),
                width: 100,
                dataIndex: POProcumentLineItemField.planned_quantity,
                render: (value, item, index) => (
                  <div style={{ textAlign: "right" }}>{value ? value : 0}</div>
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
                width: 100,
                dataIndex: POProcumentLineItemField.quantity,
                render: (value, item, index) => (
                  <NumberInput
                    placeholder="Kế hoạch nhận"
                    isFloat={false}
                    value={value}
                    min={0}
                    max={item.ordered_quantity}
                    default={0}
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
                render: (value: string, item, index: number) => (
                  <Button
                    type="link"
                    onClick={() => {
                      onRemove(index);
                    }}
                  >
                    x
                  </Button>
                ),
              },
              {
                title: "",
                width: 20,
                render: (value: string, item, index: number) => "",
              },
            ]}
            summary={(data) => {
              let ordered_quantity = 0;
              let accepted_quantity = 0;
              let planned_quantity = 0;
              let quantity = 0;
              data.forEach((item) => {
                ordered_quantity = ordered_quantity + item.ordered_quantity;
                accepted_quantity = accepted_quantity + item.accepted_quantity;
                planned_quantity = planned_quantity + item.planned_quantity;
                quantity = quantity + item.quantity;
              });
              return (
                <Table.Summary>
                  <Table.Summary.Row>
                    <Table.Summary.Cell align="center" colSpan={3} index={0}>
                      <div style={{ fontWeight: 700 }}>Tổng</div>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="right" index={1}>
                      <div style={{ fontWeight: 700 }}>{ordered_quantity}</div>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="right" index={2}>
                      <div style={{ fontWeight: 700 }}>{accepted_quantity}</div>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="right" index={3}>
                      <div style={{ fontWeight: 700 }}>{planned_quantity}</div>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="right" index={4}>
                      <div style={{ fontWeight: 700 }}>{quantity}</div>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="right" index={5}>
                      <div style={{ fontWeight: 700 }}></div>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              );
            }}
          />
        );
      }}
    </ProcumentCommonModal>
  );
};

export default ProcumentModal;
