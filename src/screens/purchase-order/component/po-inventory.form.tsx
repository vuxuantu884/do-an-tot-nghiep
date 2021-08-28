import { Card, Form, Space, Tag, Modal } from "antd";
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
import ProducmentInventoryModal from "../modal/procument-intevory.modal.tsx";
import ProcumentModal from "../modal/procument.modal";
import POInventoryDraft from "./po-inventory/po-intentory.draft";
import POInventoryView from "./po-inventory/po-inventory.view";

type POInventoryFormProps = {
  stores: Array<StoreResponse>;
  status: string;
  now: Moment;
  isEdit: boolean;
  onAddProcumentSuccess?: () => void;
  idNumber?: number;
  code?: string;
};

const POInventoryForm: React.FC<POInventoryFormProps> = (
  props: POInventoryFormProps
) => {
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const [visibleDraft, setVisibleDraft] = useState(false);
  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [visibleDelete, setVisibleDelete] = useState(false);
  const [loaddingCreate, setLoadingCreate] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [loadingRecive, setLoadingRecive] = useState(false);
  const [poItems, setPOItem] = useState<Array<PurchaseOrderLineItem>>([]);
  const [draft, setDraft] = useState<PurchaseProcument | null>(null);
  const [procumentDraft, setProcumentDraft] =
    useState<PurchaseProcument | null>(null);
  const [procumentInventory, setProcumentInventory] =
    useState<PurchaseProcument | null>(null);
  const [storeExpect, setStoreExpect] = useState<number>(-1);
  const [isEdit, setIsEdit] = useState(false);
  const { stores, status, now, idNumber, onAddProcumentSuccess, code } = props;
  const onAddProcumentCallback = useCallback(
    (value: PurchaseProcument | null) => {
      setLoadingCreate(false);
      if (value === null) {
      } else {
        if (isEdit) showSuccess("Lưu phiếu nhập kho nháp thành công");
        else showSuccess("Thêm phiếu nhập kho nháp thành công");
        setVisible(false);
        onAddProcumentSuccess && onAddProcumentSuccess();
      }
    },
    [onAddProcumentSuccess]
  );

  const onAddProcument = useCallback(
    (value: PurchaseProcument) => {
      if (idNumber) {
        setLoadingCreate(true);
        if (isEdit) {
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
    [dispatch, idNumber, onAddProcumentCallback, isEdit]
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
        setLoadingCreate(true);
        dispatch(
          PoProcumentDeleteAction(idNumber, value.id, onDeleteProcumentCallback)
        );
      }
    },
    [dispatch, idNumber, onDeleteProcumentCallback]
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
    [dispatch, idNumber, onConfirmProcumentCallback]
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
    [dispatch, idNumber, onReciveProcumentCallback]
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
              receive_status === ProcumentStatus.FINISHED ||
              receive_status === ProcumentStatus.RECEIVED
            ) {
              statusName = "Đã nhập kho";
              className += " po-tag-success";
              dotClassName += " success";
            }
            return (
              <Space>
                <div className={dotClassName} style={{ fontSize: 8 }} />
                <div className="d-flex">
                  <span className="title-card">NHẬP KHO</span>
                </div>{" "}
                <Tag className={className}>{statusName}</Tag>
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
            let receive_status: string = getFieldValue(POField.receive_status);
            setPOItem(line_items);
            return (
              receive_status !== ProcumentStatus.DRAFT &&
              receive_status !== ProcumentStatus.FINISHED &&
              receive_status !== ProcumentStatus.CANCELLED && (
                <Button
                  onClick={() => {
                    setIsEdit(false);
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
        <POInventoryDraft isEdit={props.isEdit} stores={stores} />
        {status && status !== POStatus.DRAFT && (
          <POInventoryView
            code={code}
            id={idNumber}
            onSuccess={() => {
              onAddProcumentSuccess && onAddProcumentSuccess();
            }}
            confirmDraft={(value: PurchaseProcument, isEdit: boolean) => {
              setIsEdit(isEdit);
              if (isEdit) {
                setVisible(true);
                setDraft(value);
              } else {
                setProcumentDraft(value);
                setVisibleDraft(true);
              }
            }}
            confirmInventory={(value: PurchaseProcument, isEdit: boolean) => {
              setIsEdit(isEdit);
              if (isEdit) {
                setProcumentDraft(value);
                setVisibleDraft(true);
              } else {
                setProcumentInventory(value);
                setVisibleConfirm(true);
              }
            }}
            confirmImport={(value: PurchaseProcument, isEdit: boolean) => {
              setIsEdit(isEdit);
              setProcumentInventory(value);
              setVisibleConfirm(true);
            }}
          />
        )}
      </div>
      <ProcumentModal
        onCancle={() => {
          setVisible(false);
        }}
        isEdit={isEdit}
        loading={loaddingCreate}
        stores={stores}
        now={now}
        visible={visible}
        items={poItems}
        item={draft}
        defaultStore={storeExpect}
        onOk={(value: PurchaseProcument) => {
          onAddProcument(value);
        }}
        onDelete={onDeleteProcument}
      />
      <ProcumentConfirmModal
        isEdit={isEdit}
        items={poItems}
        stores={stores}
        now={now}
        visible={visibleDraft}
        item={procumentDraft}
        onOk={(value: PurchaseProcument) => {
          onConfirmProcument(value);
        }}
        onDelete={onDeleteProcument}
        loading={loadingConfirm}
        defaultStore={storeExpect}
        onCancel={() => {
          setVisibleDraft(false);
        }}
      />
      <ProducmentInventoryModal
        isEdit={isEdit}
        items={poItems}
        stores={stores}
        now={now}
        visible={visibleConfirm}
        item={procumentInventory}
        onOk={(value: PurchaseProcument) => {
          onReciveProcument(value);
        }}
        onDelete={onDeleteProcument}
        loading={loadingRecive}
        defaultStore={storeExpect}
        onCancel={() => {
          setVisibleConfirm(false);
        }}
      />
    </Card>
  );
};

export default POInventoryForm;
