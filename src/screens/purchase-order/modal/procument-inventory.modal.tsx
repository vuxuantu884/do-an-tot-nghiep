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
import { Fragment, useCallback, useMemo, useState } from "react";
import importIcon from "assets/icon/import.svg";
import ModalImport from "component/modal/ModalImport";
import { AppConfig } from "config/app.config";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import {
  PoDetailAction
} from "domain/actions/po/po.action";
import { useDispatch } from "react-redux";
import {ProcurementStatus, ProcurementStatusName} from "../../../utils/Constants";
import AuthWrapper from "component/authorization/AuthWrapper";
import { PurchaseOrderPermission } from "config/permissions/purchase-order.permission";
import useAuthorization from "hook/useAuthorization";
import { StyledComponent } from "../../products/procurement/tabs/TabList/styles";
import statusDraft from 'assets/icon/status-draft-new.svg'
import statusFinalized from 'assets/icon/status-finalized-new.svg'
import statusStored from 'assets/icon/status-finished-new.svg'
import statusCancelled from 'assets/icon/status-cancelled-new.svg'

type ProcumentInventoryModalProps = {
  loadDetail?: (poId: number, isLoading: boolean, isSuggest: boolean) => void;
  visible: boolean;
  isEdit: boolean;
  isDetail?: boolean;
  now: Moment;
  stores: Array<StoreResponse>;
  poData?: PurchaseOrder | undefined;
  onCancel: () => void;
  item: PurchaseProcument | null;
  items: Array<PurchaseOrderLineItem>;
  defaultStore: number;
  onOk: (value: PurchaseProcument) => void;
  onDelete: (value: PurchaseProcument) => void;
  loading: boolean;
  procumentCode: string;
};

const ProcumentInventoryModal: React.FC<ProcumentInventoryModalProps> = (
  props: ProcumentInventoryModalProps
) => {
  const {
    visible,
    now,
    onCancel,
    item,
    defaultStore,
    onOk,
    onDelete,
    procumentCode,
    loading,
    items,
    stores,
    poData,
    isEdit,
    isDetail
  } = props;
  const [showImportModal, setShowImportModal] = useState<boolean>(false);

  const [itemProcument, setItemProcument] = useState<PurchaseProcument | null>(item);
  const dispatch = useDispatch();

  const [allowConfirm] = useAuthorization({
    acceptPermissions: [PurchaseOrderPermission.procurements_confirm],
  });

  const itemForm = useMemo(()=>{
    if (itemProcument === null || Object.keys(itemProcument).length === 0) {
      return item;
    }

    return itemProcument;
  },[itemProcument, item]);

  const onDetail = useCallback((result: PurchaseOrder | null)=>{
    if (result && result.procurements) {
      let data = result.procurements.find(e=>e.id === item?.id);
      setItemProcument(data ?? null);
    }

  },[item]);

  const ActionImport= {
    Ok: useCallback((res)=>{
      if (poData && poData.id) {
        dispatch(PoDetailAction(poData.id, onDetail));
      }

    },[poData, dispatch, onDetail]),
    Cancel: useCallback(()=>{
      setShowImportModal(false);
    }, []),
  }

  const renderStatusIcon = (procurement: PurchaseProcument | null) => {
    let icon = "";
    let color = ""
    if (!procurement) {
      return "";
    }
    switch (procurement.status) {
      case ProcurementStatus.draft:
        icon = statusDraft
        color = "#666666"
        break;
      case ProcurementStatus.not_received:
        icon = statusFinalized
        color = "#2A2A86"
        break;
      case ProcurementStatus.received:
        icon = statusStored
        color = "#27AE60"
        break;
      case ProcurementStatus.cancelled:
        icon = statusCancelled
        color = "#E24343"
        break;
    }
    return (
      <>
        <span>{procurement?.code} </span>
        <span style={{ color: color }} >
          {icon && <img width={20} height={20} src={icon} alt="" style={{ marginRight: 4, marginBottom: 2 }} />}
          {ProcurementStatusName[procurement.status]}
        </span>
      </>
    )
  }

  if (visible) {
    return (
      <>
      <ProcumentCommonModal
        isDetail={isDetail}
        type="inventory"
        isEdit={isEdit}
        items={items}
        item={itemForm}
        onCancel={onCancel}
        procumentCode={procumentCode}
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
          <StyledComponent>
            {isEdit ? "Sửa phiếu nhập kho " : isDetail ? "Phiếu nhập kho " : "Xác nhận nhập kho "}
              {renderStatusIcon(item)}
          </StyledComponent>
        }
        okText={isEdit ? "Lưu phiếu nhập kho" : (allowConfirm ? "Xác nhận nhập": "")}
      >
        {(onQuantityChange, onRemove, line_items) => {
          return (
            <>
              {!isDetail && (
                <AuthWrapper
                acceptPermissions={[PurchaseOrderPermission.procurements_confirm]}
                >
                <div style={{float: "right", marginBottom: 10}}>
                  <Button
                    className="light"
                    size="large"
                    icon={<img src={importIcon} style={{marginRight: 8}} alt="" />}
                    onClick={()=>{setShowImportModal(true)}}
                    hidden
                  >
                    Nhập file
                  </Button>
                </div>
                </AuthWrapper>
              )}
               <Table
                className="product-table"
               rowKey={(record: PurchaseProcumentLineItem) =>
                 record.line_item_id
               }
               rowClassName="product-table-row"
               dataSource={line_items}
               tableLayout="fixed"
               scroll={{ y: 250, x: 600 }}
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
                         <div className="product-item-name text-truncate-1">
                           <div className="product-item-name-detail">
                             {value}
                           </div>
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
                     return !isDetail ? (
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
                       replace={(a: string) =>
                        replaceFormatString(a)
                      }
                     />
                   ) : <div className="text-right mr-15">{value}</div>},
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
            </>
          );
        }}
      </ProcumentCommonModal>
        <ModalImport
          visible= {showImportModal}
          onOk= {(res)=>{ActionImport.Ok(res)} }
          onCancel= {ActionImport.Cancel}
          title= "Nhập file hàng về"
          subTitle= "hàng về"
          okText= "Xác nhận"
          templateUrl={AppConfig.PROCUMENT_IMPORT_TEMPLATE_URL}
          forder="stock-transfer"
          customParams={{conditions: poData?.id ? `${poData?.id},${item?.id}` : `${item?.id}`,
                type: "IMPORT_PROCUREMENT"}}
      />
    </>
    );
  } else return <Fragment />;
};

export default ProcumentInventoryModal;
