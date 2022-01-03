import { Card, Col, Row } from "antd";
import UrlConfig from "config/url.config";
import { POGetPurchaseOrderActionLogs } from "domain/actions/po/po.action";
import { PurchaseOrderActionLogResponse } from "model/response/po/action-log.response";
import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { PO_RETURN_HISTORY } from "utils/Constants";
import historyAction from "./images/action-history.svg";
import ActionPurchaseORderHistoryModal from "./Modal";
import { StyledComponent } from "./styles";

type PropType = {
  countChangeSubStatus?: number;
  poId?: number | null;
  reload?: boolean;
};

function ActionPurchaseOrderHistory(props: PropType) {
  const { poId, reload } = props;
  const [actionLog, setActionLog] = useState<PurchaseOrderActionLogResponse[]>([]);
  const dispatch = useDispatch();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [actionId, setActionId] = useState<number>();

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
    const resultAction = PO_RETURN_HISTORY?.find((singleStatus) => {
      return singleStatus.code === action;
    });
    if (resultAction && resultAction.title) {
      result = resultAction.title || action;
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
    if (!poId) {
      return;
    }
    if (poId || reload) {
      dispatch(
        POGetPurchaseOrderActionLogs(poId, (response: PurchaseOrderActionLogResponse[]) => {
          setActionLog(response);
        })
      );
    }
  }, [dispatch, poId, reload]);

  return (
    <StyledComponent>
      <Card title={renderCardTitle()}>
        {actionLog &&
          actionLog.length > 0 &&
          actionLog.map((singleActionHistory, index) => {
            return (
              <div
                className="singleActionHistory"
                key={index}
              >
                <Row gutter={15}>
                  <Col span={10}>
                    <div>
                      {singleActionHistory?.updated_name && (
                        <div>
                          <Link
                            target="_blank"
                            to={`${UrlConfig.ACCOUNTS}/${singleActionHistory?.updated_by}`}
                            className="primary"
                          >
                            {singleActionHistory?.updated_by}
                          </Link>
                          <h4>
                            {singleActionHistory?.updated_name}
                          </h4>
                        </div>
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
                  <Col span={14}>
                    <div className="singleActionHistory__status" >
                      {singleActionHistory?.action && (
                        <h4 
                          className="singleActionHistory__mainStatus"
                          onClick={() => {
                            showModal(singleActionHistory.id);
                          }}
                        >
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
      <ActionPurchaseORderHistoryModal
        isModalVisible={isModalVisible}
        onCancel={hideModal}
        actionId={actionId}
      />
    </StyledComponent>
  );
}

export default ActionPurchaseOrderHistory;
