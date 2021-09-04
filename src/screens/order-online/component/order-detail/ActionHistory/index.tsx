import { Card, Col, Row } from "antd";
import { actionGetOrderActionLogs } from "domain/actions/order/order.action";
import { OrderActionLogResponse } from "model/response/order/action-log.response";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import historyAction from "./images/action-history.svg";
import ActionHistoryModal from "./Modal";
import { StyledComponent } from "./styles";

type PropType = {
  orderId: string;
};

function ActionHistory(props: PropType) {
  const { orderId } = props;
  console.log("orderId", orderId);
  const [actionLog, setActionLog] = useState<OrderActionLogResponse[]>([]);
  const dispatch = useDispatch();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [actionId, setActionId] = useState<number | undefined>(undefined);

  const showModal = (actionId: number) => {
    setIsModalVisible(true);
    setActionId(actionId);
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

  useEffect(() => {
    if (orderId) {
      dispatch(
        actionGetOrderActionLogs(
          +orderId,
          (response: OrderActionLogResponse[]) => {
            setActionLog(response);
          }
        )
      );
    }
  }, [dispatch, orderId]);

  return (
    <StyledComponent>
      <Card className="margin-top-20" title={renderCardTitle()}>
        <div className="padding-24">
          {actionLog &&
            actionLog.length > 0 &&
            actionLog.map((singleActionHistory, index) => {
              console.log("singleActionHistory", singleActionHistory);
              return (
                <div
                  className="singleActionHistory"
                  key={index}
                  onClick={() => {
                    showModal(singleActionHistory.id);
                  }}
                >
                  <Row className="" gutter={15}>
                    <Col span={12}>
                      <div className="singleActionHistory__info">
                        <h4 className="singleActionHistory__title">
                          {singleActionHistory.id}
                        </h4>
                        <div className="singleActionHistory__date">
                          {singleActionHistory.id}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="singleActionHistory__status">
                        <div className="singleActionHistory__mainStatus">
                          {singleActionHistory.status}
                        </div>
                        <div className="singleActionHistory__subStatus">
                          {singleActionHistory.status}
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
        actionId={actionId}
      />
    </StyledComponent>
  );
}

export default ActionHistory;
