import { Card, Col, Row } from "antd";
import UrlConfig from "config/url.config";
import { OrderResponse } from "model/response/order/order.response";
import moment from "moment";
import { Link } from "react-router-dom";
import { DATE_FORMAT } from "utils/DateUtils";
import { StyledComponent } from "./styles";

type PropTypes = {
  OrderDetail: OrderResponse | null;
};

/**
 * Input: OrderDetail
 */
function OrderShortDetailsReturn(props: PropTypes) {
  const { OrderDetail } = props;
  const dateFormat = DATE_FORMAT.DDMMYY_HHmm;

  const detailArr = [
    {
      title: "Mã đơn trả hàng",
      value: (
        <Link to={`${UrlConfig.ORDERS_RETURN}/${OrderDetail?.id}`} target="_blank">
          {OrderDetail?.code}
        </Link>
      ),
    },
    {
      title: "Mã đơn hàng gốc",
      value:
        OrderDetail?.order_code && OrderDetail.order_id ? (
          <Link to={`${UrlConfig.ORDER}/${OrderDetail.order_id}`} target="_blank">
            {OrderDetail?.order_code}
          </Link>
        ) : (
          "-"
        ),
    },
    {
      title: "Kho cửa hàng",
      value: OrderDetail?.store ? (
        <Link to={`${UrlConfig.STORE}/${OrderDetail.store_id}`} target="_blank">
          {OrderDetail?.store}
        </Link>
      ) : (
        "-"
      ),
    },
    {
      title: "Lý do trả",
      value: OrderDetail?.reason_name,
    },
    {
      title: "Ngày trả",
      value: OrderDetail?.return_date ? moment(OrderDetail?.created_date).format(dateFormat) : "-",
    },
    {
      title: "Ngày nhận hàng",
      value: OrderDetail?.receive_date ? moment(OrderDetail?.receive_date).format(dateFormat) : "-",
    },
    {
      title: "Ngày hoàn tiền",
      value:
        OrderDetail?.payments && OrderDetail?.payments[0]
          ? moment(OrderDetail?.payments[0].created_date).format(dateFormat)
          : "-",
    },
    {
      title: "NV trả hàng",
      value: (
        <div className="breakWord">
          {OrderDetail?.account ? (
            <Link to={`${UrlConfig.ACCOUNTS}/${OrderDetail?.account_code}`} title="NV trả hàng">
              {OrderDetail.account_code} - {OrderDetail.account}
            </Link>
          ) : (
            "-"
          )}
        </div>
      ),
    },
    {
      title: "Ghi chú",
      value: <div className="breakWord">{OrderDetail?.note ? OrderDetail?.note : "-"}</div>,
    },
  ];

  return (
    <StyledComponent>
      <Card className="card-block card-block-normal" title="Thông tin Đơn trả hàng">
        {detailArr.map((detail) => {
          return (
            <Row className="rowDetail" gutter={5} key={detail.title}>
              <Col span={9}>{detail.title}:</Col>
              <Col span={15}>{detail.value}</Col>
            </Row>
          );
        })}
      </Card>
    </StyledComponent>
  );
}

export default OrderShortDetailsReturn;
