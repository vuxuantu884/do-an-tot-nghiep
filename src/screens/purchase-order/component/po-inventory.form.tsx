import { Card, Form } from "antd";
import { Button } from "antd";
import { PoProcumentCreateAction } from "domain/actions/po/po-procument.action";
import { StoreResponse } from "model/core/store.model";
import { POField } from "model/purchase-order/po-field";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import { PurchaseProcument } from "model/purchase-order/purchase-procument";
import React, { useCallback, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { POStatus } from "utils/Constants";
import { showSuccess } from "utils/ToastUtils";
import ProcumentModal from "../modal/procument.modal";
import POInventoryDraft from "./po-inventory/po-intentory.draft";
import POInventoryView from "./po-inventory/po-inventory.view";

type POInventoryFormProps = {
  stores: Array<StoreResponse>;
  status: string;
  now: Date;
  isEdit: boolean;
  onAddProcumentSuccess?: () => void;
  idNumber?: number,
};

const POInventoryForm: React.FC<POInventoryFormProps> = (
  props: POInventoryFormProps
) => {
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const [loaddingCreate, setLoadingCreate] = useState(false);
  const [poItems, setPOItem] = useState<Array<PurchaseOrderLineItem>>([]);
  const [storeExpect, setStoreExpect] = useState<number>(-1);
  const { stores, status, now, idNumber, onAddProcumentSuccess } = props;
  const onAddProcumentCallback = useCallback((value: PurchaseProcument|null) => {
    setLoadingCreate(false);
    if(value === null) {
    
    } else {
      showSuccess('Thêm phiếu nháp kho thành công');
      setVisible(false);
      onAddProcumentSuccess && onAddProcumentSuccess();
    }
  }, [onAddProcumentSuccess]);
  const onAddProcument = useCallback((value: PurchaseProcument) => {
    if(idNumber) {
      setLoadingCreate(true);
      dispatch(PoProcumentCreateAction(idNumber, value, onAddProcumentCallback))
    }
  }, [dispatch, idNumber, onAddProcumentCallback])
  return (
    <Card
      className="po-form margin-top-20"
      title={
        <div className="d-flex">
          <span className="title-card">NHẬP KHO</span>
        </div>
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
        <POInventoryDraft isEdit={props.isEdit} stores={stores} now={now} />
        {status !== POStatus.DRAFT && status !== POStatus.COMPLETED && (
          <POInventoryView />
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
          onAddProcument && onAddProcument(value);
        }}
      />
    </Card>
  );
};

export default POInventoryForm;
