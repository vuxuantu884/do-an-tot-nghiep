import { Col, Form, Progress, Row, Space } from "antd";
import deliveryIcon from "assets/icon/delivery.svg";
import procument from "assets/icon/procument.svg";
import React, { useCallback, useState } from "react";
import classNames from "classnames";
import TabAll from "./tab1";
import TabInvetory from "./tab2";
import TabConfirmed from "./tab3";
import TabDraft from "./tab4";
import { PurchaseProcument } from "model/purchase-order/purchase-procument";
import { POField } from "model/purchase-order/po-field";

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

type POInventoryViewProps = {
  confirmDraft: (item: PurchaseProcument) => void;
  confirmInventory: (item: PurchaseProcument) => void;
};

const POInventoryView: React.FC<POInventoryViewProps> = (
  props: POInventoryViewProps
) => {
  let { confirmDraft, confirmInventory } = props;
  const [activeTab, setActiveTab] = useState(TAB[0].id);
  const getComponent = useCallback(
    (id: number) => {
      switch (id) {
        case 1:
          return <TabAll />;
        case 2:
          return <TabInvetory />;
        case 3:
          return <TabConfirmed confirmInventory={confirmInventory} />;
        case 4:
          return <TabDraft confirmDraft={confirmDraft} />;
      }
    },
    [confirmDraft, confirmInventory]
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
            <Row align="middle">
              <Col span={24} md={18}>
                <div className="progress-view">
                  <Progress
                    style={{ width: "100%" }}
                    type="line"
                    percent={Math.round(
                      (receipt_quantity / planned_quantity) * 100
                    )}
                    showInfo={false}
                    strokeWidth={21}
                    strokeColor="#5D5D8A"
                    trailColor="#ECEFFA"
                  />
                  <div className="progress-view-info">
                    <div className="progress-view-receipt">
                      <span>
                        Đã nhận: {receipt_quantity ? receipt_quantity : 0}
                      </span>
                    </div>
                    <div className="progress-view-order">
                      <span>
                        Tổng: {planned_quantity ? planned_quantity : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </Col>
              <Col span={24} md={6}>
                <div style={{textAlign: 'center'}}>
                  <span>SL còn lại: {planned_quantity - receipt_quantity}</span>
                </div>
              </Col>
            </Row>
          );
        }}
      </Form.Item>
      <Row>
        <div
          className="po-inven-view"
          style={{ borderBottom: "1px solid #2A2A86" }}
        >
          <Space size={15}>
            {TAB.map((item) => (
              <div
                className={classNames(
                  "po-inven-view-tab",
                  activeTab === item.id && "active"
                )}
                key={item.id}
              >
                <div
                  onClick={() => {
                    setActiveTab(item.id);
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
      {TAB.map((item) => (
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
