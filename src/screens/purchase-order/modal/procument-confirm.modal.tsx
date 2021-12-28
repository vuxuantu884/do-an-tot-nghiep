import { Table, Button } from "antd";
import { StoreResponse } from "model/core/store.model";
import { Fragment, useState } from "react";
import {
  POProcumentLineItemField,
  PurchaseProcument,
  PurchaseProcumentLineItem,
} from "model/purchase-order/purchase-procument";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import NumberInput from "component/custom/number-input.custom";
import imgDefIcon from "assets/img/img-def.svg";
import { Moment } from "moment";

import ProcumentCommonModal from "./procument.common.modal";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import { formatCurrency } from "utils/AppUtils";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";

export type ProcumentConfirmProps = {
  visible: boolean;
  isEdit: boolean;
  now: Moment;
  stores: Array<StoreResponse>;
  onCancel: () => void;
  item: PurchaseProcument | null;
  items: Array<PurchaseOrderLineItem>;
  defaultStore: number;
  onOk: (value: PurchaseProcument) => void;
  onDelete: (value: PurchaseProcument) => void;
  loading: boolean;
  poData: PurchaseOrder | any;
};

const ProcumentConfirmModal: React.FC<ProcumentConfirmProps> = (
  props: ProcumentConfirmProps
) => {
  const {
    visible,
    now,
    poData ,
    stores,
    onCancel,
    item,
    defaultStore,
    onOk,
    onDelete,
    loading,
    items,
    isEdit,
  } = props;
  const [isShowConfirmDeleteLineItem, setIsShowConfirmDeleteLineItem] =
    useState(false);
  const [message, setMessage] = useState("");
  const [removeIndex, setRemoveIndex] = useState(-1);

  const handleRemoveLineItem = (
    item: PurchaseProcumentLineItem,
    lineIndex: number
  ) => {
    setMessage(`Bạn chắc chắn xoá ${item.sku}`);
    setRemoveIndex(lineIndex);
    setIsShowConfirmDeleteLineItem(true);
  };

  const onRemoveLineItem = (callbackFn: (index: number) => void) => {
    setIsShowConfirmDeleteLineItem(false);
    //remove here
    if (callbackFn) {
      callbackFn(removeIndex);
    }
  };
  if (visible) {
    return (
      <ProcumentCommonModal
        type="confirm"
        isEdit={isEdit}
        item={item}
        items={items}
        onCancel={onCancel}
        now={now}
        stores={stores}
        defaultStore={defaultStore}
        visible={visible}
        cancelText="Hủy"
        onOk={onOk}
        poData={poData}
        onDelete={onDelete}
        loading={loading}
        isConfirmModal={isEdit}
        title={
          <div>
            {isEdit ? "Sửa phiếu duyệt " : "Duyệt phiếu nháp "}
            <span style={{ color: "#2A2A86" }}>{item?.code}</span>
          </div>
        }
        okText={isEdit ? "Lưu phiếu duyệt" : "Duyệt phiếu nháp"}
      >
        {(onQuantityChange, onRemove, line_items) => {
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
                        src={
                          !value || !value.toString().startsWith("http")
                            ? imgDefIcon
                            : value
                        }
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
                        {/* ({POUtils.totalQuantity(items)}) */}
                      </div>
                    </div>
                  ),
                  width: 130,
                  dataIndex: POProcumentLineItemField.ordered_quantity,
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
                        flexDirection: "column",
                        display: "flex",
                      }}
                    >
                      SL đã nhận
                      <div style={{ color: "#2A2A86", fontWeight: "normal" }}>
                        {/* ({POUtils.totalQuantity(items)}) */}
                      </div>
                    </div>
                  ),
                  width: 130,
                  dataIndex: POProcumentLineItemField.sku,
                  render: (value, item, index) => {
                    let itemSku = items.find((item1) => item1.sku === value)
                    let quantity =  itemSku ? itemSku.receipt_quantity : 0
                    return (
                    <div style={{ textAlign: "right" }}>{formatCurrency(quantity,".")}</div>
                  )},
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
                      SL Nhận theo kế hoạch
                    </div>
                  ),
                  width: 160,
                  dataIndex: POProcumentLineItemField.planned_quantity,
                  render: (value, item, index) => (
                    <div style={{ textAlign: "right" }}>
                      {value ? formatCurrency(value,".") : 0}
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
                      SL nhận được duyệt
                    </div>
                  ),
                  width: 150,
                  dataIndex: POProcumentLineItemField.quantity,
                  render: (value, item, index) => (
                    <NumberInput
                      placeholder="Kế hoạch nhận"
                      isFloat={false}
                      value={value}
                      min={0}
                      max={item.quantity}
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
                  width: isEdit ? 0: 40,
                  render: (value: string, item, index: number) =>{
                    return isEdit ? <Fragment/>
                     :<Button
                      type="link"
                      onClick={() => {
                        handleRemoveLineItem(item, index);
                      }}
                    >
                      x
                    </Button>
                  } ,
                },
                {
                  title: "",
                  width: 20,
                  render: (value: string, item, index: number) => "",
                },
              ]}
              summary={(data) => {
                let ordered_quantity = 0;
                let real_quantity = 0;
                let planned_quantity = 0;
                let quantity = 0;
                data.forEach((item) => {
                  ordered_quantity += item.ordered_quantity;
                  let itemSku = items.find((item1) => item1.sku === item.sku)
                  if(itemSku) {
                    real_quantity = real_quantity + itemSku.receipt_quantity
                  }
                  planned_quantity += item.planned_quantity;
                  quantity += item.quantity;
                });
                return (
                  <Table.Summary>
                    <Table.Summary.Row>
                      <Table.Summary.Cell align="center" colSpan={3} index={0}>
                        <div style={{ fontWeight: 700 }}>Tổng</div>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell align="right" index={1}>
                        <div style={{ fontWeight: 700 }}>
                          {formatCurrency(ordered_quantity,".")}
                        </div>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell align="right" index={2}>
                        <div style={{ fontWeight: 700 }}>
                          {formatCurrency(real_quantity,".")}
                        </div>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell align="right" index={3}>
                        <div style={{ fontWeight: 700 }}>
                          {formatCurrency(planned_quantity,".")}
                        </div>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell align="right" index={4}>
                        <div style={{ fontWeight: 700, marginRight: 15 }}>
                          {formatCurrency(quantity,".")}
                        </div>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    <ModalDeleteConfirm
                      visible={isShowConfirmDeleteLineItem}
                      onOk={() => onRemoveLineItem(onRemove)}
                      onCancel={() => {
                        setIsShowConfirmDeleteLineItem(false);
                      }}
                      title={
                        <span style={{ fontSize: "1rem" }}>{message}</span>
                      }
                    ></ModalDeleteConfirm>
                  </Table.Summary>
                );
              }}
            />
          );
        }}
      </ProcumentCommonModal>
    );
  } else return <Fragment />;
};

export default ProcumentConfirmModal;
