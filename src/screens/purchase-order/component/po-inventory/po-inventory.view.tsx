import { Form, Row, Space } from "antd";
import React, { useCallback, lazy } from "react";
import classNames from "classnames";
import { PurchaseProcument } from "model/purchase-order/purchase-procument";
import { POField } from "model/purchase-order/po-field";
import POProgressView from "../po-progress-view";

const TabAll = lazy(() => import("./tab1"))
const TabInvetory = lazy(() => import("./tab2"))
const TabConfirmed = lazy(() => import("./tab3"))
const TabDraft = lazy(() => import("./tab4"))

type POInventoryViewProps = {
  id?: number;
  code?: string;
  onSuccess: () => void;
  confirmDraft: (item: PurchaseProcument, isEdit: boolean, procumentCode: string) => void;
  confirmInventory: (item: PurchaseProcument, isEdit: boolean) => void;
  tabs: Array<any>;
  activeTab: number;
  selectTabChange: (id: number) => void;
};

const POInventoryView: React.FC<POInventoryViewProps> = (
  props: POInventoryViewProps
) => {
  const {
    confirmDraft,
    confirmInventory,
    id: poId,
    onSuccess,
    code,
    tabs,
    activeTab,
    selectTabChange,
  } = props;
  const getComponent = useCallback(
    (id: number) => {
      switch (id) {
        case 1:
          return <TabAll onSuccess={onSuccess} id={poId} code={code} />;
        case 2:
          return <TabInvetory />;
        case 3:
          return <TabConfirmed confirmInventory={confirmInventory} />;
        case 4:
          return <TabDraft confirmDraft={confirmDraft} />;
      }
    },
    [code, confirmDraft, confirmInventory, onSuccess, poId]
  );
  return (
    <React.Fragment>
      <Form.Item
        noStyle
        shouldUpdate={(prev, current) =>
          prev[POField.planned_quantity] !==
            current[POField.planned_quantity] &&
          prev[POField.receipt_quantity] !== current[POField.receipt_quantity]
        }
      >
        {({ getFieldValue }) => {
          let planned_quantity = getFieldValue(POField.planned_quantity);
          let receipt_quantity = getFieldValue(POField.receipt_quantity);
          return (
            <POProgressView
              remainTitle={receipt_quantity - planned_quantity > 0 ? "SL NHẬP DƯ" : "SL CÒN LẠI"}
              receivedTitle={"ĐÃ NHẬN"}
              received={receipt_quantity}
              total={planned_quantity}
            />
          );
        }}
      </Form.Item>
      <Row>
        <div
          className="po-inven-view"
          style={{ borderBottom: "1px solid #2A2A86" }}
        >
          <Space size={15}>
            {tabs.map((item) => (
              <div
                className={classNames(
                  "po-inven-view-tab",
                  activeTab === item.id && "active"
                )}
                key={item.id}
              >
                <div
                  onClick={() => {
                    selectTabChange(item.id);
                  }}
                  className="tab"
                >
                  <img src={item.icon} className="tab-icon" alt="icon"></img>
                  <span>{item.name}</span>
                </div>
              </div>
            ))}
          </Space>
        </div>
      </Row>
      {tabs.map((item) => (
        <div
          className={classNames(
            "tab-content",
            activeTab === item.id && "active"
          )}
          key={item.id}
        >
          {getComponent(item.id)}
        </div>
      ))}
    </React.Fragment>
  );
};

export default POInventoryView;
