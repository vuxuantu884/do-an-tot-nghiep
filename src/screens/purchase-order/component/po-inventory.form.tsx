import { Card, Form, Input, Space, Tag } from "antd";
import { Button } from "antd";
import {
  PoProcumentCreateAction,
  PoProcumentUpdateAction,
  PoProcumentDeleteAction,
  ConfirmPoProcumentAction,
  ApprovalPoProcumentAction,
} from "domain/actions/po/po-procument.action";
import { StoreResponse } from "model/core/store.model";
import { POField } from "model/purchase-order/po-field";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import { PurchaseProcument, PurchaseProcurementViewDraft } from "model/purchase-order/purchase-procument";
import { Moment } from "moment";
import React, {useCallback, useState, useEffect, useRef, lazy} from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { POStatus, ProcumentStatus } from "utils/Constants";
import { showSuccess } from "utils/ToastUtils";
import POInventoryDraft from "./po-inventory/POInventoryDraft";
import POInventoryView from "./po-inventory/po-inventory.view";
import importIcon from "assets/icon/import-card.svg";
import dashboardIcon from "assets/icon/dashboard.svg";
import checkIcon from "assets/icon/check.svg";
import editIcon from "assets/icon/edit.svg";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { PoUpdateAction } from "domain/actions/po/po.action";
import AuthWrapper from "component/authorization/AuthWrapper";
import { PurchaseOrderPermission } from "config/permissions/purchase-order.permission";

const ProcumentConfirmModal = lazy(() => import("../modal/procument-confirm.modal"))
const ProcumentInventoryModal = lazy(() => import("../modal/procument-inventory.modal"))
const ProcumentModal = lazy(() => import("../modal/procument.modal"))
const POEditDraftProcurementModal = lazy(() => import("../modal/POEditDraftProcurementModal"))

export type POInventoryFormProps = {
  loadDetail?: (poId: number, isLoading: boolean, isSuggest: boolean) => void;
  stores: Array<StoreResponse>;
  status: string;
  now: Moment;
  isEdit: boolean;
  onAddProcumentSuccess?: (isSuggest: boolean) => void;
  idNumber?: number;
  poData?: PurchaseOrder;
  formMain?: any;
  isShowStatusTag?: boolean;
};

const TAB = [
  {
    name: "Tổng quan",
    id: 1,
    icon: dashboardIcon,
  },
  {
    name: "Phiếu nhập kho",
    id: 2,
    icon: importIcon,
  },
  {
    name: "Phiếu đã duyệt",
    id: 3,
    icon: checkIcon,
  },
  {
    name: "Phiếu nháp",
    id: 4,
    icon: editIcon,
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
    loadDetail
  } = props;

  const [activeTab, setActiveTab] = useState(TAB[0].id);
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const [visibleEditProcurement, setVisibleEditProcurement] = useState(false);
  const [visibleDraft, setVisibleDraft] = useState(false);
  const procumentCodeRef = useRef('');
  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [loaddingCreate, setLoadingCreate] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [loadingRecive, setLoadingRecive] = useState(false);
  const [poItems, setPOItem] = useState<Array<PurchaseOrderLineItem>>([]);
  const [draft, setDraft] = useState<PurchaseProcument | null>(null);
  const [procumentDraft, setProcumentDraft] =
    useState<PurchaseProcument | null>(null);
  const [procuments, setProcuments] = useState<Array<PurchaseProcurementViewDraft>>([]);
  const [procumentInventory, setProcumentInventory] =
    useState<PurchaseProcument | null>(null);
  const [storeExpect, setStoreExpect] = useState<number>(-1);
  const [isEditProcument, setEditProcument] = useState<boolean>(false);
  const [loadingEditDraft, setLoadingEditDraft] = useState<boolean>(false);

  const onAddProcumentCallback = useCallback(
    (value: PurchaseProcument | null) => {
      setLoadingCreate(false);
      if (value === null) {
      } else {
        if (isEditProcument) showSuccess("Lưu phiếu nhập kho nháp thành công");
        else showSuccess("Thêm phiếu nhập kho nháp thành công");
        setVisible(false);
        onAddProcumentSuccess && onAddProcumentSuccess(false);
      }
    },
    [isEditProcument, onAddProcumentSuccess]
  );

  const onAddProcument = useCallback(
    (value: PurchaseProcument) => {
      if (idNumber) {
        if (!poData) return;
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

  const onDeleteProcumentCallback = useCallback((result) => {
    if (result !== null) {
      setLoadingCreate(false);
      showSuccess("Huỷ phiếu nháp thành công");
      setVisible(false);
      setVisibleDraft(false);
      setVisibleConfirm(false);
      onAddProcumentSuccess && onAddProcumentSuccess(false);
    }
  }, [onAddProcumentSuccess]);

  const onDeleteProcument = useCallback(
    (value: PurchaseProcument) => {
      if (idNumber && value.id) {
        if (!poData) return;
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
        onAddProcumentSuccess && onAddProcumentSuccess(false);
      }
    },
    [onAddProcumentSuccess]
  );

  const onConfirmProcument = useCallback(
    (value: PurchaseProcument) => {
      if (idNumber && value.id) {
        if (!poData) return;
        setLoadingConfirm(true);
        console.log('onConfirmProcument', value);
        dispatch(
          ApprovalPoProcumentAction(
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
        onAddProcumentSuccess && onAddProcumentSuccess(false);
      }
    },
    [onAddProcumentSuccess]
  );

  const onUpdateCall = useCallback((result) => {
    setLoadingEditDraft(false);
    if (result !== null) {
      setVisibleEditProcurement(false);
      onAddProcumentSuccess && onAddProcumentSuccess(false);
    }
  }, [onAddProcumentSuccess])

  const onReciveProcument = useCallback(
    (value: PurchaseProcument) => {
      if (idNumber && value.id) {
        if (!poData) return;
        setLoadingRecive(true);
        dispatch(
          ConfirmPoProcumentAction(
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
  }, [visible, poData, stores]);
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
            if (status === ProcumentStatus.DRAFT) {
              return <Space>
                <div className="d-flex">
                  <span className="title-card">NHẬP KHO</span>
                </div>{" "}
              </Space>
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
            let procurements: Array<PurchaseProcurementViewDraft> = getFieldValue(
              POField.procurements
            ) || [];
            let receive_status: string = getFieldValue(POField.receive_status);
            if (!status) {
              return null;
            }
            if (
              (status === ProcumentStatus.DRAFT)
            ) {
              if (!props.isEdit) {
                return null;
              }
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
              status !== POStatus.CANCELLED &&
              receive_status !== ProcumentStatus.FINISHED &&
              receive_status !== ProcumentStatus.CANCELLED && (
                <AuthWrapper
                  acceptPermissions={[PurchaseOrderPermission.procurements_create]}
                >
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
                    className="create-button-custom ant-btn-outline fixed-button"
                  >
                    Tạo phiếu nhập kho nháp
                  </Button>
                </AuthWrapper>
              )
            );
          }}
        </Form.Item>
      }
    >
      <Form.Item hidden noStyle name={POField.receive_status}>
        <Input />
      </Form.Item>
      <div>
        {status && status !== POStatus.DRAFT ? (
          <POInventoryView
            tabs={TAB}
            activeTab={activeTab}
            selectTabChange={(id) => setActiveTab(id)}
            code={poData ? poData.code : undefined}
            id={idNumber}
            onSuccess={() => {
              onAddProcumentSuccess && onAddProcumentSuccess(true);
            }}
            confirmDraft={(value: PurchaseProcument, isEdit: boolean, procumentCode?: string) => {
              setEditProcument(isEdit);
              let line_items = formMain.getFieldValue(POField.line_items);
              setPOItem(line_items);
              if (isEdit) {
                setVisible(true);
                setDraft(value);
              } else {
                setProcumentDraft(value);
                setVisibleDraft(true);
              }
              procumentCodeRef.current = procumentCode||'';
            }}
            confirmInventory={(value: PurchaseProcument, isEdit: boolean, procumentCode?: string) => {
              setEditProcument(isEdit);
              let line_items = formMain.getFieldValue(POField.line_items);
              setPOItem(line_items);
              if (isEdit) {
                setProcumentDraft(value);
                setVisibleDraft(true);
              } else {
                setProcumentInventory(value);
                setVisibleConfirm(true);
              }
              procumentCodeRef.current = procumentCode||'';
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

      {
        visible && (
          <ProcumentModal
            onCancle={() => {
              setVisible(false);
            }}
            isEdit={isEditProcument}
            loading={loaddingCreate}
            stores={stores}
            poData={poData}
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
            procumentCode={procumentCodeRef.current}
          />
        )
      }
      {
        visibleDraft && (
          <ProcumentConfirmModal
            isEdit={isEditProcument}
            items={poItems}
            stores={stores}
            poData={poData}
            procumentCode={procumentCodeRef.current}
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
        )
      }
      {
        visibleConfirm && (
          <ProcumentInventoryModal
            loadDetail={loadDetail}
            isEdit={isEditProcument}
            items={poItems}
            stores={stores}
            now={now}
            visible={visibleConfirm}
            poData={poData}
            item={procumentInventory}
            onOk={(value: PurchaseProcument) => {
              onReciveProcument(value);
              setActiveTab(TAB[1].id);
            }}
            onDelete={onDeleteProcument}
            loading={loadingRecive}
            defaultStore={storeExpect}
            procumentCode={procumentCodeRef.current}
            onCancel={() => {
              setVisibleConfirm(false);
            }}
          />
        )
      }
      {
        visibleEditProcurement && (
          <POEditDraftProcurementModal
            stores={stores}
            visible={visibleEditProcurement}
            onCancel={() => setVisibleEditProcurement(false)}
            onOk={(value: Array<PurchaseProcurementViewDraft>) => {
              setLoadingEditDraft(true);
              let data = formMain.getFieldsValue(true);
              let dataClone = { ...data, procurements: value }
              if (idNumber) {
                dispatch(PoUpdateAction(idNumber, dataClone, onUpdateCall));
              }
            }}
            lineItems={poItems}
            dataSource={procuments}
            confirmLoading={loadingEditDraft}
          />
        )
      }
    </Card>
  );
};

POInventoryForm.defaultProps = {
  isShowStatusTag: true,
};

export default POInventoryForm;
