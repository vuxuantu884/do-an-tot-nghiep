import { Card, Form, Space, Tag } from "antd";
import { Button } from "antd";
import {
  PoProcumentCreateAction,
  PoProcumentUpdateAction,
} from "domain/actions/po/po-procument.action";
import { StoreResponse } from "model/core/store.model";
import { POField } from "model/purchase-order/po-field";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import { PurchaseProcument } from "model/purchase-order/purchase-procument";
import { Moment } from "moment";
import React, { useCallback, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { POStatus } from "utils/Constants";
import { showSuccess } from "utils/ToastUtils";
import ProcumentConfirmModal from "../modal/procument-confirm.modal";
import ProducmentInventoryModal from "../modal/procument-intevory.modal.tsx";
import ProcumentModal from "../modal/procument.modal";
import POInventoryDraft from "./po-inventory/po-intentory.draft";
import POInventoryView from "./po-inventory/po-inventory.view";
import { ProcumentStatus } from "utils/Constants";

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
  const [loaddingCreate, setLoadingCreate] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [loadingRecive, setLoadingRecive] = useState(false);
  const [poItems, setPOItem] = useState<Array<PurchaseOrderLineItem>>([]);
  const [procumentDraft, setProcumentDraft] =
    useState<PurchaseProcument | null>(null);
  const [procumentInventory, setProcumentInventory] =
    useState<PurchaseProcument | null>(null);
  const [storeExpect, setStoreExpect] = useState<number>(-1);
  const { stores, status, now, idNumber, onAddProcumentSuccess, code } = props;
  const onAddProcumentCallback = useCallback(
    (value: PurchaseProcument | null) => {
      setLoadingCreate(false);
      if (value === null) {
      } else {
        showSuccess("Thêm phiếu nháp kho thành công");
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
        dispatch(
          PoProcumentCreateAction(idNumber, value, onAddProcumentCallback)
        );
      }
    },
    [dispatch, idNumber, onAddProcumentCallback]
  );
  const onConfirmProcumentCallback = useCallback(
    (value: PurchaseProcument | null) => {
      setLoadingConfirm(false);
      if (value === null) {
      } else {
        showSuccess("Thêm phiếu nháp kho thành công");
        setVisible(false);
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
  return (
    <Card
      className="po-form margin-top-20"
      title={
        <Form.Item
          noStyle
          shouldUpdate={(prev, current) =>
            prev[POField.financial_status] !== current[POField.financial_status]
          }
        >
          {({ getFieldValue }) => {
            let financial_status = getFieldValue(POField.financial_status);
            let statusName = "Chưa nhập kho";
            let className = "po-tag";
            let dotClassName = "icon-dot";
            if (financial_status === ProcumentStatus.PARTIAL_RECEIVED) {
              statusName = "Nhập kho 1 phần";
              className += " po-tag-warning";
              dotClassName += " partial";
            }
            if (
              financial_status === ProcumentStatus.CANCELLED ||
              financial_status === ProcumentStatus.FINISHED ||
              financial_status === ProcumentStatus.RECEIVED
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
            prev[POField.line_items] !== current[POField.line_items]
          }
        >
          {({ getFieldValue }) => {
            let line_items: Array<PurchaseOrderLineItem> = getFieldValue(
              POField.line_items
            );
            let expect_store_id: number = getFieldValue(
              POField.expect_store_id
            );
            return (
              status !== POStatus.DRAFT && (
                <Button
                  onClick={() => {
                    setStoreExpect(expect_store_id);
                    setPOItem(line_items);
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
        {status && status !== POStatus.DRAFT && status !== POStatus.COMPLETED && (
          <POInventoryView
            code={code}
            id={idNumber}
            onSuccess={() => {
              onAddProcumentSuccess && onAddProcumentSuccess();
            }}
            confirmDraft={(value: PurchaseProcument) => {
              setProcumentDraft(value);
              setVisibleDraft(true);
            }}
            confirmInventory={(value: PurchaseProcument) => {
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
        loading={loaddingCreate}
        stores={stores}
        now={now}
        visible={visible}
        items={poItems}
        defaultStore={storeExpect}
        onOk={(value: PurchaseProcument) => {
          onAddProcument(value);
        }}
      />
      <ProcumentConfirmModal
        stores={stores}
        now={now}
        visible={visibleDraft}
        item={procumentDraft}
        onOk={(value: PurchaseProcument) => {
          onConfirmProcument(value);
        }}
        loading={loadingConfirm}
        defaultStore={storeExpect}
        onCancel={() => {
          setVisibleDraft(false);
        }}
      />
      <ProducmentInventoryModal
        stores={stores}
        now={now}
        visible={visibleConfirm}
        item={procumentInventory}
        onOk={(value: PurchaseProcument) => {
          onReciveProcument(value);
        }}
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
