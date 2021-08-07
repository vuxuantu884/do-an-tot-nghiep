import { Card, Form } from "antd";
import { Button } from "antd";
import { StoreResponse } from "model/core/store.model";
import { POField } from "model/purchase-order/po-field";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import React, {useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { POStatus } from "utils/Constants";
import ProcumentModal from "../modal/procument.modal";
import POInventoryDraft from "./po-inventory/po-intentory.draft";
import POInventoryView from "./po-inventory/po-inventory.view";

type POInventoryFormProps = {
  stores: Array<StoreResponse>;
  status: string;
  now: Date;
  isEdit: boolean;
};

const POInventoryForm: React.FC<POInventoryFormProps> = (
  props: POInventoryFormProps
) => {

  const [visible, setVisible] = useState(false);
  const [poItems, setPOItem] = useState<Array<PurchaseOrderLineItem>>([]);
  const { stores, status, now } = props;
  return (
    <Card
      className="po-form margin-top-20"
      title={
        <div className="d-flex">
          <span className="title-card">NHẬP KHO</span>
        </div>
      }
      extra={
        <Form.Item noStyle shouldUpdate={(prev, current) => prev[POField.line_items] !== current[POField.line_items]}>
          {({ getFieldValue }) => {
            let line_items: Array<PurchaseOrderLineItem> = getFieldValue(POField.line_items);
            return (
              status !== POStatus.DRAFT && (
                <Button
                  onClick={() => {
                    setPOItem(line_items);
                    setVisible(true);
                  }}
                  style={{
                    alignItems: 'center',
                    display: 'flex',
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
        {
          status !== POStatus.DRAFT &&  status !== POStatus.COMPLETED && 
          <POInventoryView />
        }
      </div>
      <ProcumentModal 
        onCancle={() => {setVisible(false)}} 
        stores={stores} 
        now={now}  
        visible={visible} 
        items={poItems}
      />
    </Card>
  );
};

export default POInventoryForm;
