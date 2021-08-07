import { Row, Space } from "antd";
import deliveryIcon from "assets/icon/delivery.svg";
import procument from "assets/icon/procument.svg";
import React, { useState } from "react";
import classNames from "classnames";
import TabAll from "./tab1";
import TabInvetory from "./tab2";
import TabConfirmed from "./tab3";
import TabDraft from "./tab4";

const TAB = [
  {
    name: "Tổng quan",
    id: 1,
    icon: deliveryIcon,
    component: TabAll,
  },
  {
    name: "Phiếu nhập kho",
    id: 2,
    icon: deliveryIcon,
    component: TabInvetory,
  },
  {
    name: "Phiếu đã duyệt",
    id: 3,
    icon: procument,
    component: TabConfirmed,
  },
  {
    name: "Phiếu nháp",
    id: 4,
    icon: deliveryIcon,
    component: TabDraft,
  },
];
const POInventoryView = () => {
  const [activeTab, setActiveTab] = useState(TAB[0].id);
  return (
    <React.Fragment>
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
          <item.component />
        </div>
      ))}
    </React.Fragment>
  );
};

export default POInventoryView;
