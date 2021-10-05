import { Card, Form, Space, Tag } from "antd";
import { Button } from "antd";
import {
  PoProcumentCreateAction,
  PoProcumentUpdateAction,
  PoProcumentDeleteAction,
} from "domain/actions/po/po-procument.action";
import { StoreResponse } from "model/core/store.model";
import { POField } from "model/purchase-order/po-field";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import { PurchaseProcument } from "model/purchase-order/purchase-procument";
import { Moment } from "moment";
import React, { useCallback, useState, useEffect } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { POStatus, ProcumentStatus } from "utils/Constants";
import { showSuccess } from "utils/ToastUtils";
import ProcumentConfirmModal from "../modal/procument-confirm.modal";
import ProcumentInventoryModal from "../modal/procument-inventory.modal.tsx";
import ProcumentModal from "../modal/procument.modal";
import POInventoryDraft from "./po-inventory/POInventoryDraft";
import POInventoryView from "./po-inventory/po-inventory.view";
import deliveryIcon from "assets/icon/delivery.svg";
import procument from "assets/icon/procument.svg";
import { POUtils } from "utils/POUtils";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import POEditDraftProcurementModal from "../modal/POEditDraftProcurementModal";

type POInventoryFormProps = {
  stores: Array<StoreResponse>;
  status: string;
  now: Moment;
  isEdit: boolean;
  onAddProcumentSuccess?: () => void;
  idNumber?: number;
  poData?: PurchaseOrder;
  formMain?: any;
  isShowStatusTag?: boolean;
};

const TAB = [
  {
    name: "Tổng quan",
    id: 1,
    icon: deliveryIcon,
  },
  {
    name: "Phiếu nhập kho",
    id: 2,
    icon: deliveryIcon,
  },
  {
    name: "Phiếu đã duyệt",
    id: 3,
    icon: procument,
  },
  {
    name: "Phiếu nháp",
    id: 4,
    icon: deliveryIcon,
  },
];

const POInventoryForm: React.FC<POInventoryFormProps> = (
  props: POInventoryFormProps
) => {
  const {
    stores,
    status,
    now,
    idNumber,
    onAddProcumentSuccess,
    poData,
    formMain,
    isShowStatusTag,
  } = props;

  const [activeTab, setActiveTab] = useState(TAB[0].id);
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const [visibleEditProcurement, setVisibleEditProcurement] = useState(false);
  const [visibleDraft, setVisibleDraft] = useState(false);
  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [loaddingCreate, setLoadingCreate] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [loadingRecive, setLoadingRecive] = useState(false);
  const [poItems, setPOItem] = useState<Array<PurchaseOrderLineItem>>([]);
  const [draft, setDraft] = useState<PurchaseProcument | null>(null);
  const [procumentDraft, setProcumentDraft] =
    useState<PurchaseProcument | null>(null);
  const [procuments, setProcuments] = useState<Array<PurchaseProcument>>([]);
  const [procumentInventory, setProcumentInventory] =
    useState<PurchaseProcument | null>(null);
  const [storeExpect, setStoreExpect] = useState<number>(-1);
  const [isEditProcument, setEditProcument] = useState<boolean>(false);

  const onAddProcumentCallback = useCallback(
    (value: PurchaseProcument | null) => {
      setLoadingCreate(false);
      if (value === null) {
      } else {
        if (isEditProcument) showSuccess("Lưu phiếu nhập kho nháp thành công");
        else showSuccess("Thêm phiếu nhập kho nháp thành công");
        setVisible(false);
        onAddProcumentSuccess && onAddProcumentSuccess();
      }
    },
    [isEditProcument, onAddProcumentSuccess]
  );

  const onAddProcument = useCallback(
    (value: PurchaseProcument) => {
      if (idNumber) {
        if (!poData) return;
        value.status_po = POUtils.calculatePOStatus(
          poData,
          value,
          null,
          "update"
        );
        setLoadingCreate(true);
        if (isEditProcument) {
          dispatch(
            PoProcumentUpdateAction(
              idNumber,
              value.id,
              value,
              onAddProcumentCallback
            )
          );
        } else {
          dispatch(
            PoProcumentCreateAction(idNumber, value, onAddProcumentCallback)
          );
        }
      }
    },
    [idNumber, poData, isEditProcument, dispatch, onAddProcumentCallback]
  );

  const onDeleteProcumentCallback = useCallback(() => {
    setLoadingCreate(false);
    showSuccess("Xóa phiếu nháp thành công");
    setVisible(false);
    setVisibleDraft(false);
    setVisibleConfirm(false);
    onAddProcumentSuccess && onAddProcumentSuccess();
  }, [onAddProcumentSuccess]);

  const onDeleteProcument = useCallback(
    (value: PurchaseProcument) => {
      if (idNumber && value.id) {
        if (!poData) return;
        value.status_po = POUtils.calculatePOStatus(
          poData,
          value,
          null,
          "delete"
        );
        setLoadingCreate(true);
        dispatch(
          PoProcumentDeleteAction(idNumber, value.id, onDeleteProcumentCallback)
        );
      }
    },
    [dispatch, idNumber, onDeleteProcumentCallback, poData]
  );

  const onConfirmProcumentCallback = useCallback(
    (value: PurchaseProcument | null) => {
      setLoadingConfirm(false);
      if (value === null) {
      } else {
        showSuccess("Thêm phiếu nháp kho thành công");
        setVisibleDraft(false);
        onAddProcumentSuccess && onAddProcumentSuccess();
      }
    },
    [onAddProcumentSuccess]
  );

  const onConfirmProcument = useCallback(
    (value: PurchaseProcument) => {
      if (idNumber && value.id) {
        if (!poData) return;
        value.status_po = POUtils.calculatePOStatus(
          poData,
          value,
          null,
          "update"
        );
        setLoadingConfirm(true);
        dispatch(
          PoProcumentUpdateAction(
            idNumber,
            value.id,
            value,
            onConfirmProcumentCallback
          )
        );
      }
    },
    [dispatch, idNumber, onConfirmProcumentCallback, poData]
  );

  const onReciveProcumentCallback = useCallback(
    (value: PurchaseProcument | null) => {
      setLoadingConfirm(false);
      if (value === null) {
      } else {
        showSuccess("Xác nhận nhập kho thành công");
        setVisibleConfirm(false);
        setLoadingRecive(false);
        onAddProcumentSuccess && onAddProcumentSuccess();
      }
    },
    [onAddProcumentSuccess]
  );

  const onReciveProcument = useCallback(
    (value: PurchaseProcument) => {
      if (idNumber && value.id) {
        if (!poData) return;
        value.status_po = POUtils.calculatePOStatus(
          poData,
          value,
          null,
          "update"
        );
        setLoadingRecive(true);
        dispatch(
          PoProcumentUpdateAction(
            idNumber,
            value.id,
            value,
            onReciveProcumentCallback
          )
        );
      }
    },
    [dispatch, idNumber, onReciveProcumentCallback, poData]
  );

  useEffect(() => {
    if (visible === false) setDraft(null);
  }, [visible]);
  return (
    <Card
      className="po-form margin-top-20"
      title={
        <Form.Item
          noStyle
          shouldUpdate={(prev, current) =>
            prev[POField.receive_status] !== current[POField.receive_status]
          }
        >
          {({ getFieldValue }) => {
            let receive_status = getFieldValue(POField.receive_status);
            let statusName = "Chưa nhập kho";
            let className = "po-tag";
            let dotClassName = "icon-dot";
            if (receive_status === ProcumentStatus.PARTIAL_RECEIVED) {
              statusName = "Nhập kho 1 phần";
              className += " po-tag-warning";
              dotClassName += " partial";
            }
            if (
              receive_status === ProcumentStatus.CANCELLED ||
              receive_status === ProcumentStatus.RECEIVED
            ) {
              statusName = "Đã nhập kho";
              className += " po-tag-success";
              dotClassName += " success";
            }
            if (receive_status === ProcumentStatus.FINISHED) {
              statusName = "Đã nhận hàng";
              className += " po-tag-success";
              dotClassName += " success";
            }

            return (
              <Space>
                {isShowStatusTag && (
                  <div className={dotClassName} style={{ fontSize: 8 }} />
                )}
                <div className="d-flex">
                  <span className="title-card">NHẬP KHO</span>
                </div>{" "}
                {isShowStatusTag && (
                  <Tag className={className}>{statusName}</Tag>
                )}
              </Space>
            );
          }}
        </Form.Item>
      }
      extra={
        <Form.Item
          noStyle
          shouldUpdate={(prev, current) =>
            prev[POField.line_items] !== current[POField.line_items] ||
            prev[POField.expect_store_id] !==
              current[POField.expect_store_id] ||
            prev[POField.receive_status] !== current[POField.receive_status]
          }
        >
          {({ getFieldValue }) => {
            let expect_store_id: number = getFieldValue(
              POField.expect_store_id
            );
            let line_items: Array<PurchaseOrderLineItem> = getFieldValue(
              POField.line_items
            );
            let procurements: Array<PurchaseProcument> = getFieldValue(
              POField.procurements
            );
            let receive_status: string = getFieldValue(POField.receive_status);
            if (
              (receive_status || status) === ProcumentStatus.DRAFT &&
              props.isEdit
            ) {
              return (
                <Button
                  onClick={() => {
                    setEditProcument(false);
                    setStoreExpect(expect_store_id);
                    setPOItem(line_items)
                    setVisibleEditProcurement(true);
                    setProcuments(procurements);
                  }}
                  style={{
                    alignItems: "center",
                    display: "flex",
                  }}
                  type="primary"
                  className="create-button-custom ant-btn-outline fixed-button"
                >
                  Sửa kế hoạch nhập kho
                </Button>
              );
            }
            return (
              receive_status !== ProcumentStatus.DRAFT &&
              receive_status !== ProcumentStatus.FINISHED &&
              receive_status !== ProcumentStatus.CANCELLED && (
                <Button
                  onClick={() => {
                    setEditProcument(false);
                    setPOItem(line_items);
                    setStoreExpect(expect_store_id);
                    setVisible(true);
                  }}
                  style={{
                    alignItems: "center",
                    display: "flex",
                  }}
                  icon={<AiOutlinePlus size={16} />}
                  type="primary"
                  className="create-button-custom ant-btn-outline fixed-button"
                >
                  Tạo phiếu nhập kho nháp
                </Button>
              )
            );
          }}
        </Form.Item>
      }
    >
      <div className="padding-20">
        {status && status !== POStatus.DRAFT ? (
          <POInventoryView
            tabs={TAB}
            activeTab={activeTab}
            selectTabChange={(id) => setActiveTab(id)}
            code={poData ? poData.code : undefined}
            id={idNumber}
            onSuccess={() => {
              onAddProcumentSuccess && onAddProcumentSuccess();
            }}
            confirmDraft={(value: PurchaseProcument, isEdit: boolean) => {
              setEditProcument(isEdit);
              if (isEdit) {
                setVisible(true);
                setDraft(value);
              } else {
                setProcumentDraft(value);
                setVisibleDraft(true);
              }
            }}
            confirmInventory={(value: PurchaseProcument, isEdit: boolean) => {
              setEditProcument(isEdit);
              if (isEdit) {
                setProcumentDraft(value);
                setVisibleDraft(true);
              } else {
                setProcumentInventory(value);
                setVisibleConfirm(true);
              }
            }}
          />
        ) : (
          <POInventoryDraft
            formMain={formMain}
            isEdit={props.isEdit}
            stores={stores}
          />
        )}
      </div>
      <ProcumentModal
        onCancle={() => {
          setVisible(false);
        }}
        isEdit={isEditProcument}
        loading={loaddingCreate}
        stores={stores}
        now={now}
        visible={visible}
        items={poItems}
        item={draft}
        defaultStore={storeExpect}
        onOk={(value: PurchaseProcument) => {
          onAddProcument(value);
          setActiveTab(TAB[3].id);
        }}
        onDelete={onDeleteProcument}
      />
      <ProcumentConfirmModal
        isEdit={isEditProcument}
        items={poItems}
        stores={stores}
        now={now}
        visible={visibleDraft}
        item={procumentDraft}
        onOk={(value: PurchaseProcument) => {
          onConfirmProcument(value);
          setActiveTab(TAB[2].id);
        }}
        onDelete={onDeleteProcument}
        loading={loadingConfirm}
        defaultStore={storeExpect}
        onCancel={() => {
          setVisibleDraft(false);
        }}
      />
      <ProcumentInventoryModal
        isEdit={isEditProcument}
        items={poItems}
        stores={stores}
        now={now}
        visible={visibleConfirm}
        item={procumentInventory}
        onOk={(value: PurchaseProcument) => {
          onReciveProcument(value);
          setActiveTab(TAB[1].id);
        }}
        onDelete={onDeleteProcument}
        loading={loadingRecive}
        defaultStore={storeExpect}
        onCancel={() => {
          setVisibleConfirm(false);
        }}
      />
      <POEditDraftProcurementModal
        stores={stores}
        visible={visibleEditProcurement}
        onCancel={() => setVisibleEditProcurement(false)}
        onOk={() => {}}
        lineItems={poItems}
        dataSource={procuments}
      />
    </Card>
  );
};

POInventoryForm.defaultProps = {
  isShowStatusTag: true,
};

export default POInventoryForm;
