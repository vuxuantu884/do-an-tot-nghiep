import { Card, Col, Row } from "antd";
import UrlConfig from "config/url.config";
import { GetListOrderCustomerAction } from "domain/actions/order/order.action";
import { OrderModel } from "model/order/order.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { formatCurrency } from "utils/AppUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import { StyledComponent } from "./styles";

type PropTypes = {
  customerId: number | undefined;
};

function SidebarOrderHistory(props: PropTypes) {
  const dateFormat = DATE_FORMAT.fullDate;
  const { customerId } = props;
  const dispatch = useDispatch();
  const [customerHistory, setCustomerHistory] = useState<OrderModel[] | null>(null);
  const bootstrapReducer = useSelector((state: RootReducerType) => state.bootstrapReducer);
  const orderMainStatuses = bootstrapReducer.data?.order_main_status;

  const renderIfNotCustomerHistory = () => {
    if (!customerHistory) {
      return "Vui lòng chọn khách hàng!";
    }
  };

  const renderIfCustomerHistory = () => {
    if (customerHistory) {
      return customerHistory?.map((single) => {
        return (
          <Row className="" gutter={15} key={single.id}>
            <Col span={15}>
              <div className="singleHistoryOrder__info">
                <h4 className="singleHistoryOrder__title">
                  {moment(single.created_date).format(dateFormat)}
                </h4>
                <div className="singleHistoryOrder__date">
                  <Link target="_blank" to={`${UrlConfig.ORDER}/${single.id}`}>
                    {single.code}
                  </Link>{" "}
                  - <span className="nowrap">SL: {single.actual_quantity}</span>
                </div>
              </div>
            </Col>
            <Col span={9}>
              <div className="singleHistoryOrder__status">
                <h4 className="singleHistoryOrder__mainStatus">
                  {formatCurrency(single.total_line_amount_after_line_discount)}
                  <span className="unit">₫</span>
                </h4>
                <div className="singleActionHistory__subStatus">
                  {orderMainStatuses?.find((status) => status.value === single.status)?.name}
                </div>
              </div>
            </Col>
          </Row>
        );
      });
    }
  };

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
        }),
      );
    }
  }, [customerId, dispatch]);

  return (
    <StyledComponent>
      <Card title="Lịch sử mua hàng">
        {renderIfNotCustomerHistory()}
        {renderIfCustomerHistory()}
      </Card>
    </StyledComponent>
  );
}

export default SidebarOrderHistory;
