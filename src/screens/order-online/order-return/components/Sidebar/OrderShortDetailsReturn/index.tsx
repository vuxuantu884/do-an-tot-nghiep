import { Card, Col, Row } from "antd";
import { OrderResponse } from "model/response/order/order.response";
import moment from "moment";
import { DATE_FORMAT } from "utils/DateUtils";
import { StyledComponent } from "./styles";

type PropType = {
  OrderDetail: OrderResponse | null;
};

/**
 * Input: OrderDetail
 */
function OrderShortDetailsReturn(props: PropType) {
  const { OrderDetail } = props;
  console.log("OrderDetail", OrderDetail);
  return (
    <StyledComponent>
      <Card
        className="card-block card-block-normal"
        title={
          <div className="d-flex">
            <span className="title-card">Thông tin Đơn TRẢ hàng</span>
          </div>
        }
      >
        <div className="padding-24">
          <Row className="" gutter={5}>
            <Col span={9}>Mã đơn hàng:</Col>
            <Col span={15}>
              <span
                style={{ fontWeight: 500, color: "#2A2A86" }}
                className="text-focus"
              >
                {OrderDetail?.code}
              </span>
            </Col>
          </Row>
          <Row className="margin-top-10" gutter={5}>
            <Col span={9}>Lý do trả:</Col>
            <Col span={15}>{OrderDetail?.reason_name}</Col>
          </Row>
          <Row className="margin-top-10" gutter={5}>
            <Col span={9}>Ngày trả:</Col>
            <Col span={15}>
              {OrderDetail?.return_date
                ? moment(OrderDetail?.return_date).format(
                    DATE_FORMAT.DDMMYY_HHmm
                  )
                : "-"}
            </Col>
          </Row>
          <Row className="margin-top-10" gutter={5}>
            <Col span={9}>Ngày nhận hàng:</Col>
            <Col span={15}>
              {OrderDetail?.receive_date
                ? moment(OrderDetail?.receive_date).format(
                    DATE_FORMAT.DDMMYY_HHmm
                  )
                : "-"}
            </Col>
          </Row>
          <Row className="margin-top-10" gutter={5}>
            <Col span={9}>Ngày hoàn tiền:</Col>
            <Col span={15}>
              {OrderDetail?.payments && OrderDetail?.payments[0]
                ? moment(OrderDetail?.payments[0].created_date).format(
                    DATE_FORMAT.DDMMYY_HHmm
                  )
                : "-"}
            </Col>
          </Row>
          <Row className="margin-top-10" gutter={5}>
            <Col span={9}>Nhân viên trả hàng:</Col>
            <Col span={15} style={{ wordWrap: "break-word" }}>
              {OrderDetail?.account ? OrderDetail?.account : "-"}
            </Col>
          </Row>
          <Row className="margin-top-10" gutter={5}>
            <Col span={9}>Ghi chú:</Col>
            <Col span={15} style={{ wordWrap: "break-word" }}>
              {OrderDetail?.note ? OrderDetail?.note : "-"}
            </Col>
          </Row>
        </div>
      </Card>
    </StyledComponent>
  );
}

export default OrderShortDetailsReturn;
