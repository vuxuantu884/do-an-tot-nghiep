import { Card, Col, Row } from "antd";
import { actionGetOrderActionLogs } from "domain/actions/order/order.action";
import { RootReducerType } from "model/reducers/RootReducerType";
import { OrderActionLogResponse } from "model/response/order/action-log.response";
import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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

  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );
  const LIST_STATUS = bootstrapReducer.data?.order_main_status;

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

  const renderSingleActionLogTitle = (action?: string) => {
    if (!action) {
      return;
    }
    let result = "";
    const resultAction = LIST_STATUS?.find((singleStatus) => {
      return singleStatus.value === action;
    });
    if (resultAction && resultAction.name) {
      result = resultAction.name;
    }
    return result;
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
                          {singleActionHistory?.store}
                        </h4>
                        <div className="singleActionHistory__date">
                          {moment(singleActionHistory.updated_date).format(
                            "HH:mm DD/MM/YYYY"
                          )}
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="singleActionHistory__status">
                        <div className="singleActionHistory__mainStatus">
                          {renderSingleActionLogTitle(
                            singleActionHistory?.action
                          )}
                        </div>
                        <div className="singleActionHistory__subStatus">
                          {singleActionHistory?.status}
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
