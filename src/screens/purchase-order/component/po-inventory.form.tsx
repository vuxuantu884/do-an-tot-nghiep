import { Card } from "antd";
import { Button } from "antd";
import { StoreResponse } from "model/core/store.model";
import { POField } from "model/purchase-order/po-field";
import React from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { POStatus } from "utils/Constants";
import POInventoryDraft from "./po-inventory/po-intentory.draft";

type POInventoryFormProps = {
  stores: Array<StoreResponse>;
  status: string;
  now: Date;
  isEdit: boolean;
};

const POInventoryForm: React.FC<POInventoryFormProps> = (
  props: POInventoryFormProps
) => {
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
        status !== POStatus.DRAFT && (
          <Button
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
      }
    >
      <div className="padding-20">
        <POInventoryDraft isEdit={props.isEdit} stores={stores} now={now} />
      </div>
    </Card>
  );
};

export default POInventoryForm;
