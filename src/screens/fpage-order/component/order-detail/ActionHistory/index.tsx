import { Card, Col, Row } from "antd";
import Modal from "antd/lib/modal/Modal";
import React, { useState } from "react";
import historyAction from "./images/action-history.svg";
import ActionHistoryModal from "./Modal";
import { StyledComponent } from "./styles";

function ActionHistory() {
  const FAKE_ACTION_HISTORY = [
    {
      name: "YODY kho Online",
      date: "10:10 12/07/2021",
      statusText: "Giao hàng thành công",
      subStatusText: null,
    },
    {
      name: "YD0681 -  Đỗ Văn Tùng",
      date: "10:10 12/07/2021",
      statusText: "Sửa đơn hàng",
      subStatusText: "Đang xác nhận -> Đã xác nhận",
    },
    {
      name: "YD0681 -  Đỗ Văn Tùng",
      date: "10:10 12/07/2021",
      statusText: "Xác nhận",
      subStatusText: "Mới -> Đang xác nhận",
    },
    {
      name: "YD0681 -  Đỗ Văn Tùng",
      date: "10:10 12/07/2021",
      statusText: "Tạo đơn hàng",
      subStatusText: "Mới ",
    },
  ];

  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const renderCardTitle = () => {
    return (
      <div className="cardTitle">
        <img src={historyAction} alt=""></img>
        <span>Lịch sử thao tác đơn hàng</span>
      </div>
    );
  };
  return (
    <StyledComponent>
      <Card className="margin-top-20" title={renderCardTitle()}>
        <div className="padding-24">
          {FAKE_ACTION_HISTORY &&
            FAKE_ACTION_HISTORY.length > 0 &&
            FAKE_ACTION_HISTORY.map((singleActionHistory, index) => {
              return (
                <div className="singleActionHistory" key={index}>
                  <Row className="" gutter={15}>
                    <Col span={12}>
                      <div className="singleActionHistory__info">
                        <h4 className="singleActionHistory__title">
                          {singleActionHistory.name}
                        </h4>
                        <div className="singleActionHistory__date">
                          {singleActionHistory.date}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="singleActionHistory__status">
                        <div
                          className="singleActionHistory__mainStatus"
                          onClick={() => {
                            showModal();
                          }}
                        >
                          {singleActionHistory.statusText}
                        </div>
                        <div className="singleActionHistory__subStatus">
                          {singleActionHistory.subStatusText}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              );
            })}
        </div>
      </Card>
      <ActionHistoryModal
        isModalVisible={isModalVisible}
        onCancel={hideModal}
      />
    </StyledComponent>
  );
}

export default ActionHistory;
