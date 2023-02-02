import { Card, Col, Row } from "antd";
import { actionGetOrderActionLogs } from "domain/actions/order/order.action";
import { OrderActionLogResponse } from "model/response/order/action-log.response";
import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { DATE_FORMAT } from "utils/DateUtils";
import { DISPLAYED_ORDER_ACTION_LOGS } from "utils/Order.constants";
import historyAction from "./images/action-history.svg";
import ActionHistoryModal from "./Modal";
import { StyledComponent } from "./styles";

type Props = {
  countChangeSubStatus: number;
  orderId?: number | null;
  reload?: boolean;
};

function ActionHistory(props: Props) {
  const dateFormat = DATE_FORMAT.fullDate;

  const { orderId, countChangeSubStatus, reload } = props;
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

  const renderSingleActionLogTitle = (action?: string) => {
    if (!action) {
      return;
    }
    let result = action;
    const resultAction = DISPLAYED_ORDER_ACTION_LOGS?.find((singleStatus) => {
      return singleStatus.code === action;
    });
    if (resultAction && resultAction.title) {
      result = resultAction.title || action;
    }
    return result;
  };

  const renderSingleSubStatus = (status_before?: string, status_after?: string) => {
    const separator = " -> ";
    let result = "";
    if (!status_before && !status_after) {
      return "-";
    } else {
      const arr = [status_before, status_after];
      const filterArr = arr.filter((single) => single); // lọc khác null
      result = filterArr.join(separator);
      return result;
    }
  };

  const renderActionHistoryStore = (singleActionHistory: OrderActionLogResponse) => {
    if (singleActionHistory?.store) {
      return (
        <h4 className="singleActionHistory__store">
          <span title="Kho hàng">{singleActionHistory?.store}</span>
        </h4>
      );
    }
  };

  const renderActionHistoryTitle = (singleActionHistory: OrderActionLogResponse) => {
    if (singleActionHistory?.updated_by) {
      return (
        <h4 className="singleActionHistory__title">
          {singleActionHistory?.updated_by} - {singleActionHistory?.updated_name}
        </h4>
      );
    }
  };

  const renderActionHistoryDate = (singleActionHistory: OrderActionLogResponse) => {
    if (singleActionHistory?.updated_date) {
      return (
        <div className="singleActionHistory__date">
          {moment(singleActionHistory?.updated_date).format(dateFormat)}
        </div>
      );
    }
  };

  useEffect(() => {
    if (!orderId) {
      return;
    }
    if (orderId || reload) {
      dispatch(
        actionGetOrderActionLogs(orderId, (response: OrderActionLogResponse[]) => {
          setActionLog(response);
        }),
      );
    }
  }, [dispatch, orderId, countChangeSubStatus, reload]);

  return (
    <StyledComponent>
      <Card title={renderCardTitle()}>
        {actionLog &&
          actionLog.length > 0 &&
          actionLog
            .sort((a, b) => moment(b.updated_date).diff(moment(a.updated_date)))
            .map((singleActionHistory, index) => {
              if (!singleActionHistory.action) {
                return null;
              }
              return (
                <div
                  className="singleActionHistory 53"
                  key={index}
                  onClick={() => {
                    showModal(singleActionHistory.id);
                  }}
                >
                  <Row className="" gutter={15}>
                    <Col span={12}>
                      <div className="singleActionHistory__info">
                        {renderActionHistoryStore(singleActionHistory)}
                        {renderActionHistoryTitle(singleActionHistory)}
                        {renderActionHistoryDate(singleActionHistory)}
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
                            singleActionHistory?.status_after,
                          )}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              );
            })}
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
