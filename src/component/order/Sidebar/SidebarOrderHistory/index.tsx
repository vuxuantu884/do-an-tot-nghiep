import {Card, Col, Row} from "antd";
import UrlConfig from "config/url.config";
import {GetListOrderCustomerAction} from "domain/actions/order/order.action";
import {OrderModel} from "model/order/order.model";
import {RootReducerType} from "model/reducers/RootReducerType";
import moment from "moment";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Link} from "react-router-dom";
import {formatCurrency} from "utils/AppUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import {StyledComponent} from "./styles";

type PropType = {
  customerId: number | undefined;
};

function SidebarOrderHistory(props: PropType) {
  const formatDate = DATE_FORMAT.fullDate;
  const {customerId} = props;
  const dispatch = useDispatch();
  const [customerHistory, setCustomerHistory] = useState<OrderModel[] | null>(null);
  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );
  const LIST_STATUS = bootstrapReducer.data?.order_main_status;

  useEffect(() => {
    if (customerId) {
      const queryParams = {
        limit: 4,
        page: 1,
        customer_ids: customerId,
      };
      dispatch(
        GetListOrderCustomerAction(queryParams, (response) => {
          if (response) {
            setCustomerHistory(response.items);
          }
        })
      );
    }
  }, [customerId, dispatch]);

  return (
    <StyledComponent>
      <Card title="Lịch sử mua hàng">
        {!customerHistory
          ? "Vui lòng chọn khách hàng!"
          : customerHistory?.map((single) => {
              return (
                <Row className="" gutter={15} key={single.id}>
                  <Col span={15}>
                    <div className="singleHistoryOrder__info">
                      <h4 className="singleHistoryOrder__title">
                        {moment(single.created_date).format(formatDate)}
                      </h4>
                      <div className="singleHistoryOrder__date">
                        <Link
                          target="_blank"
                          to={`${UrlConfig.ORDER}/${single.id}`}
                          style={{fontWeight: "bold"}}
                        >
                          {single.code}
                        </Link>{" "}
                        -{" "}
                        <span style={{whiteSpace: "nowrap"}}>
                          SL: {single.items.length}
                        </span>
                      </div>
                    </div>
                  </Col>
                  <Col span={9}>
                    <div
                      className="singleHistoryOrder__status"
                      style={{textAlign: "right"}}
                    >
                      <h4 className="singleHistoryOrder__mainStatus">
                        {formatCurrency(single.total_line_amount_after_line_discount)}
                        <span
                          style={{color: "#808080", marginLeft: "2px", fontWeight: 400}}
                        >
                          ₫
                        </span>
                      </h4>
                      <div className="singleActionHistory__subStatus">
                        {
                          LIST_STATUS?.find((status) => status.value === single.status)
                            ?.name
                        }
                      </div>
                    </div>
                  </Col>
                </Row>
              );
            })}
      </Card>
    </StyledComponent>
  );
}

export default SidebarOrderHistory;
