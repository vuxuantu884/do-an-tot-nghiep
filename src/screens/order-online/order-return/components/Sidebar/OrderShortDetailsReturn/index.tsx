import {Card, Col, Row} from "antd";
import UrlConfig from "config/url.config";
import {OrderResponse} from "model/response/order/order.response";
import moment from "moment";
import {Link} from "react-router-dom";
import {DATE_FORMAT} from "utils/DateUtils";
import {StyledComponent} from "./styles";

type PropType = {
  OrderDetail: OrderResponse | null;
};

/**
 * Input: OrderDetail
 */
function OrderShortDetailsReturn(props: PropType) {
  const {OrderDetail} = props;
  return (
    <StyledComponent>
      <Card className="card-block card-block-normal" title="Thông tin Đơn TRẢ hàng">
			<Row className="rowDetail" gutter={5}>
          <Col span={9}>Mã đơn trả hàng:</Col>
          <Col span={15}>
            <span style={{fontWeight: 500, color: "#2A2A86"}} className="text-focus">
              <Link to={`${UrlConfig.ORDERS_RETURN}/${OrderDetail?.id}`} target="_blank">
                {OrderDetail?.code}
              </Link>
            </span>
          </Col>
        </Row>
        <Row className="rowDetail" gutter={5}>
          <Col span={9}>Mã đơn hàng gốc:</Col>
          <Col span={15}>
            <span style={{fontWeight: 500, color: "#2A2A86"}} className="text-focus">
              {OrderDetail?.order_code && OrderDetail.order_id ? (
                <Link to={`${UrlConfig.ORDER}/${OrderDetail.order_id}`} target="_blank">
                  {OrderDetail?.order_code}
                </Link>
              ) : (
                "-"
              )}
            </span>
          </Col>
        </Row>
        <Row className="rowDetail" gutter={5}>
          <Col span={9}>Kho cửa hàng:</Col>
          <Col span={15}>
            <span style={{fontWeight: 500, color: "#2A2A86"}} className="text-focus">
              {OrderDetail?.store ? (
                <Link to={`${UrlConfig.STORE}/${OrderDetail.store_id}`} target="_blank">
                  {OrderDetail?.store}
                </Link>
              ) : (
                "-"
              )}
            </span>
          </Col>
        </Row>
        <Row className="rowDetail" gutter={5}>
          <Col span={9}>Lý do trả:</Col>
          <Col span={15}>{OrderDetail?.reason_name}</Col>
        </Row>
        <Row className="rowDetail" gutter={5}>
          <Col span={9}>Ngày trả:</Col>
          <Col span={15}>
            {OrderDetail?.return_date
              ? moment(OrderDetail?.return_date).format(DATE_FORMAT.DDMMYY_HHmm)
              : "-"}
          </Col>
        </Row>
        <Row className="rowDetail" gutter={5}>
          <Col span={9}>Ngày nhận hàng:</Col>
          <Col span={15}>
            {OrderDetail?.receive_date
              ? moment(OrderDetail?.receive_date).format(DATE_FORMAT.DDMMYY_HHmm)
              : "-"}
          </Col>
        </Row>
        <Row className="rowDetail" gutter={5}>
          <Col span={9}>Ngày hoàn tiền:</Col>
          <Col span={15}>
            {OrderDetail?.payments && OrderDetail?.payments[0]
              ? moment(OrderDetail?.payments[0].created_date).format(
                  DATE_FORMAT.DDMMYY_HHmm
                )
              : "-"}
          </Col>
        </Row>
        <Row className="rowDetail" gutter={5}>
          <Col span={9}>NV trả hàng:</Col>
          <Col span={15} style={{wordWrap: "break-word"}}>
            {OrderDetail?.account ? OrderDetail?.account : "-"}
          </Col>
        </Row>
        <Row className="rowDetail" gutter={5}>
          <Col span={9}>Ghi chú:</Col>
          <Col span={15} style={{wordWrap: "break-word"}}>
            {OrderDetail?.note ? OrderDetail?.note : "-"}
          </Col>
        </Row>
      </Card>
    </StyledComponent>
  );
}

export default OrderShortDetailsReturn;
