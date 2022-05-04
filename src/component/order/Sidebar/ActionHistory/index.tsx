import { Card, Col, Row } from "antd";
import { actionGetOrderActionLogs } from "domain/actions/order/order.action";
import { OrderActionLogResponse } from "model/response/order/action-log.response";
import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { DATE_FORMAT } from "utils/DateUtils";
import historyAction from "./images/action-history.svg";
import ActionHistoryModal from "./Modal";
import { StyledComponent } from "./styles";

type PropType = {
  countChangeSubStatus: number;
  orderId?: number | null;
  reload?: boolean;
};

function ActionHistory(props: PropType) {
  const listActionLogDisplay = [
    {
      action: "create",
      displayName: "Tạo mới đơn hàng",
    },
    {
      action: "update",
      displayName: "Sửa đơn hàng",
    },
    {
      action: "cancel",
      displayName: "Sửa đơn hàng",
    },
    {
      action: "delivery_update",
      displayName: "Hãng vận chuyển cập nhật trạng thái",
    },
    {
      action: "update_status",
      displayName: "Đổi trạng thái",
    },
    {
      action: "system_update",
      displayName: "Hệ thống tự cập nhật",
    },
  ];
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
    const resultAction = listActionLogDisplay?.find((singleStatus) => {
      return singleStatus.action === action;
    });
    if (resultAction && resultAction.displayName) {
      result = resultAction.displayName || action;
    }
    return result;
  };

  const renderSingleSubStatus = (status_before?: string, status_after?: string) => {
    const separator = " -> ";
    let result = "";
    if (!status_before && !status_after) {
      return "-"
    } else {
      const arr = [status_before, status_after];
      const filterArr = arr.filter(single => single); // lọc khác null
      result = filterArr.join(separator);
      return result;
    }
  };

  useEffect(() => {
    if(!orderId) {
      return;
    }
    if (orderId || reload) {
      dispatch(
        actionGetOrderActionLogs(orderId, (response: OrderActionLogResponse[]) => {
          setActionLog(response);
        })
      );
    }
  }, [dispatch, orderId, countChangeSubStatus, reload]);

  return (
    <StyledComponent>
      <Card title={renderCardTitle()}>
        {actionLog &&
          actionLog.length > 0 &&
          actionLog.sort((a, b) =>(moment(b.updated_date).diff(moment(a.updated_date)))).map((singleActionHistory, index) => {
            if(!singleActionHistory.action) {
              return null
            }
            return (
              <div
                className="singleActionHistory"
                key={index}
                onClick={() => {
                  showModal(singleActionHistory.id);
                }}
              >
                <Row className="" gutter={15}>
                  <Col span={10}>
                    <div className="singleActionHistory__info">
                      {singleActionHistory?.store && (
                        <h4 className="singleActionHistory__title">
                          {singleActionHistory?.updated_name}
                        </h4>
                      )}
                      {singleActionHistory?.updated_date && (
                        <div className="singleActionHistory__date">
                          {moment(singleActionHistory?.updated_date).format(
                            DATE_FORMAT.fullDate
                          )}
                        </div>
                      )}
                    </div>
                  </Col>
                  <Col span={14}>
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
