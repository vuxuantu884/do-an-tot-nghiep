import { Card, Col, Row } from "antd";
import { actionGetOrderReturnLog } from "domain/actions/order/order-return.action";
import { OrderActionLogResponse } from "model/response/order/action-log.response";
import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { ORDER_RETURN_HISTORY } from "utils/Order.constants";
import historyAction from "./images/action-history.svg";
import ActionHistoryModal from "./Modal";
import { StyledComponent } from "./styles";

type PropType = {
  countChangeSubStatus: number;
  orderId: string;
};

function OrderReturnActionHistory(props: PropType) {
  const { orderId, countChangeSubStatus } = props;
  const [actionLog, setActionLog] = useState<OrderActionLogResponse[]>([]);
  const dispatch = useDispatch();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [actionId, setActionId] = useState<number | undefined>();

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
        <span>Lịch sử thao tác đơn trả hàng</span>
      </div>
    );
  };

  const renderSingleActionLogTitle = (action?: string) => {
    if (!action) {
      return;
    }
    let result = action;
    const resultAction = ORDER_RETURN_HISTORY.find((singleStatus) => {
      return singleStatus.code === action;
    });
    if (resultAction) {
      result = resultAction.title;
    }
    return result;
  };

  const renderSingleSubStatus = (status_before?: string, status_after?: string) => {
    let result = "";
    if (status_before && status_after) {
      result = `${status_before} -> ${status_after}`;
    } else if (!status_before) {
      result = `${status_after}`;
    } else if (!status_after) {
      result = `${status_before}`;
    }
    return result;
  };

  useEffect(() => {
    if (orderId) {
      dispatch(
        actionGetOrderReturnLog(+orderId, (response: OrderActionLogResponse[]) => {
          setActionLog(response);
        })
      );
    }
  }, [dispatch, orderId, countChangeSubStatus]);

  return (
    <StyledComponent>
      <Card title={renderCardTitle()}>
        <div>
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
                        {singleActionHistory?.store && (
                          <h4 className="singleActionHistory__title">
                            {singleActionHistory?.updated_name}
                          </h4>
                        )}
                        {singleActionHistory?.updated_date && (
                          <div className="singleActionHistory__date">
                            {moment(singleActionHistory?.updated_date).format(
                              "HH:mm DD/MM/YYYY"
                            )}
                          </div>
                        )}
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="singleActionHistory__status">
                        {singleActionHistory?.action && (
                          <h4 className="singleActionHistory__mainStatus">
                            {renderSingleActionLogTitle(singleActionHistory?.action)}
                          </h4>
                        )}
                        <div className="singleActionHistory__subStatus">
                          {renderSingleSubStatus(
                            singleActionHistory?.status_before,
                            singleActionHistory?.status_after
                          )}
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

export default OrderReturnActionHistory;
