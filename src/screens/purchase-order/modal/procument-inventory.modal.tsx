import { Button, Table } from "antd";
import { StoreResponse } from "model/core/store.model";
import {
  POProcumentLineItemField,
  PurchaseProcument,
  PurchaseProcumentLineItem,
} from "model/purchase-order/purchase-procument";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import imgDefIcon from "assets/img/img-def.svg";
import NumberInput from "component/custom/number-input.custom";
import { POUtils } from "utils/POUtils";
import { Moment } from "moment";

import ProcumentCommonModal from "./procument.common.modal";
import { Fragment, useCallback, useState } from "react";
import importIcon from "assets/icon/import.svg";
import ModalImport from "component/modal/ModalImport";
import { AppConfig } from "config/app.config";
import { formatCurrency } from "utils/AppUtils";

type ProducmentInventoryModalProps = {
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
};

const ProducmentInventoryModal: React.FC<ProducmentInventoryModalProps> = (
  props: ProducmentInventoryModalProps
) => {
  const {
    visible,
    now,
    onCancel,
    item,
    defaultStore,
    onOk,
    onDelete,
    loading,
    items,
    stores,
    isEdit,
  } = props;

  
  const [showImportModal, setShowImportModal] = useState<boolean>(false);

  const ActionImport= {
    Ok: useCallback((res)=>{ 
      setShowImportModal(false);
    },[]),
    Cancel: useCallback(()=>{
      setShowImportModal(false);
    },[]),
  }

  if (visible) {
    return (
      <ProcumentCommonModal
        type="inventory"
        isEdit={isEdit}
        items={items}
        item={item}
        onCancle={onCancel}
        now={now}
        stores={stores}
        defaultStore={defaultStore}
        visible={visible}
        cancelText="Hủy"
        onOk={onOk}
        onDelete={onDelete}
        loading={loading}
        isConfirmModal={true}
        title={
          <div>
            {isEdit ? "Sửa phiếu nhập kho " : "Xác nhận nhập kho phiếu nháp "}
            <span style={{ color: "#2A2A86" }}>{item?.code}</span>
          </div>
        }
        okText={isEdit ? "Lưu phiếu nhập kho" : "Xác nhận nhập"}
      >
        {(onQuantityChange, onRemove, line_items) => {
          return (
            <> 
               <div style={{float: "right", marginBottom: 10}}>
                   <Button
                         className="light"
                         size="large"
                         icon={<img src={importIcon} style={{marginRight: 8}} alt="" />}
                         onClick={()=>{setShowImportModal(true)}}
                       >
                     Nhập file
                   </Button>
               </div>
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
                         ({formatCurrency(POUtils.totalOrderQuantityProcument(line_items),".")})
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
                   render: (value, item, index) => {
                     return (
                     <NumberInput
                       placeholder="SL thực nhận"
                       isFloat={false}
                       value={value}
                       min={0}
                       // max={item.quantity}
                       default={0}
                       maxLength={8}
                       onChange={(quantity: number | null) => {
                         onQuantityChange(quantity, index);
                       }}
                       format={(a: string) => formatCurrency(a)}
                     />
                   )},
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
                 });
                 return (
                   <Table.Summary>
                     <Table.Summary.Row>
                       <Table.Summary.Cell align="left" colSpan={3} index={0}>
                         <div style={{ fontWeight: 700 }}>Tổng</div>
                       </Table.Summary.Cell>
                       <Table.Summary.Cell align="right" index={1}>
                         <div style={{ fontWeight: 700 }}>
                           {formatCurrency(ordered_quantity,".")}
                         </div>
                       </Table.Summary.Cell>
                       <Table.Summary.Cell align="right" index={2}>
                         <div style={{ fontWeight: 700 }}>{formatCurrency(quantity,".")}</div>
                       </Table.Summary.Cell>
                       <Table.Summary.Cell align="right" index={3}>
                         <div style={{ fontWeight: 700, marginRight: 15 }}>
                           {formatCurrency(real_quantity,".")}
                         </div>
                       </Table.Summary.Cell>
                     </Table.Summary.Row>
                   </Table.Summary>
                 );
               }}
              />

              <ModalImport
                visible= {showImportModal}
                onOk= {(res)=>{ActionImport.Ok(res)} }
                onCancel= {ActionImport.Cancel}
                title= "Nhập file hàng về"
                subTitle= "hàng về"
                okText= "Nhập file"
                cancelText= "Hủy"
                templateUrl={AppConfig.PROCUMENT_IMPORT_TEMPLATE_URL}
                forder="stock-transfer"
                customParams={{conditions: `${item?.purchase_order.id},${item?.id}`, 
                      type: "IMPORT_PROCUREMENT"}}
              />
            </> 
          );
        }}
      </ProcumentCommonModal>
    );
  } else return <Fragment />;
};

export default ProducmentInventoryModal;
