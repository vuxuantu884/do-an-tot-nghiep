import { Card, Col, Row, Tag } from "antd";
import UrlConfig from "config/url.config";
import { GetListOrderCustomerAction } from "domain/actions/order/order.action";
import { OrderModel } from "model/order/order.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { formatCurrency } from "utils/AppUtils";
import { StyledComponent } from "./styles";

type PropType = {
  customerId: number | undefined;
};

function SidebarOrderHistory(props: PropType) {
  const formatDate = "hh:mm DD-MM-YYYY";
  const { customerId } = props;
  console.log("customerId", customerId);
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
          console.log("response", response);
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
          ? "Vui lòng chọn khách hàng"
          : customerHistory?.map((single) => {
              return (
                <Row className="" gutter={15} key={single.id}>
                  <Col span={10}>
                    <div className="singleHistoryOrder__info">
                      <h4 className="singleHistoryOrder__title">
                        <Link to={`${UrlConfig.ORDER}/${single.id}`}>
                          {moment(single.finalized_on).format(formatDate)}
                        </Link>
                      </h4>
                      <div className="singleHistoryOrder__date">
                        SL: {single.items.length}
                      </div>
                    </div>
                  </Col>
                  <Col span={14}>
                    <div className="singleHistoryOrder__status">
                      <h4 className="singleHistoryOrder__mainStatus">
                        {formatCurrency(single.total_line_amount_after_line_discount)}
                        <span
                          style={{ color: "#808080", marginLeft: "2px", fontWeight: 400 }}
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
