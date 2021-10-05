import { Card, Col, Row } from "antd";
import { OrderResponse } from "model/response/order/order.response";
import { StyledComponent } from "./styles";

type PropType = {
  OrderDetail: OrderResponse | null;
};

/**
 * Input: OrderDetail
 */
function OrderShortDetails(props: PropType) {
  const { OrderDetail } = props;
  console.log("OrderDetail", OrderDetail);
  return (
    <StyledComponent>
      <Card
        className="card-block card-block-normal"
        title={
          <div className="d-flex">
            <span className="title-card">THÔNG TIN ĐƠN HÀNG</span>
          </div>
        }
      >
        <div className="padding-24">
          <Row className="" gutter={5}>
            <Col span={11}>Cửa hàng:</Col>
            <Col span={13}>
              <span
                style={{ fontWeight: 500, color: "#2A2A86" }}
                className="text-focus"
              >
                {OrderDetail?.store}
              </span>
            </Col>
          </Row>
          <Row className="margin-top-10" gutter={5}>
            <Col span={11}>Điện thoại:</Col>
            <Col span={13}>
              <span style={{ fontWeight: 500, color: "#222222" }}>
                {OrderDetail?.customer_phone_number}
              </span>
            </Col>
          </Row>
          <Row className="margin-top-10" gutter={5}>
            <Col span={11}>Địa chỉ:</Col>
            <Col span={13}>
              <span style={{ fontWeight: 500, color: "#222222" }}>
                {OrderDetail?.shipping_address?.full_address}
              </span>
            </Col>
          </Row>
          <Row className="margin-top-10" gutter={5}>
            <Col span={11}>Nhân viên bán hàng:</Col>
            <Col span={13}>
              <span
                style={{ fontWeight: 500, color: "#222222" }}
                className="text-focus"
              >
                {OrderDetail?.assignee}
              </span>
            </Col>
          </Row>
          <Row className="margin-top-10" gutter={5}>
            <Col span={11}>Nhân viên marketing:</Col>
            <Col span={13}>
              <span
                style={{ fontWeight: 500, color: "#222222" }}
                className="text-focus"
              >
                {OrderDetail?.marketer}
              </span>
            </Col>
          </Row>
          <Row className="margin-top-10" gutter={5}>
            <Col span={11}>Nhân viên điều phối:</Col>
            <Col span={13}>
              <span
                style={{ fontWeight: 500, color: "#222222" }}
                className="text-focus"
              >
                {OrderDetail?.coordinator}
              </span>
            </Col>
          </Row>
          <Row className="margin-top-10" gutter={5}>
            <Col span={11}>Người tạo:</Col>
            <Col span={13}>
              <span
                style={{ fontWeight: 500, color: "#222222" }}
                className="text-focus"
              >
                {OrderDetail?.account}
              </span>
            </Col>
          </Row>
          <Row className="margin-top-10" gutter={5}>
            <Col span={11}>Đường dẫn:</Col>
            <Col span={13} style={{ wordWrap: "break-word" }}>
              {OrderDetail?.url ? (
                <a href={OrderDetail?.url}>{OrderDetail?.url}</a>
              ) : (
                <span className="text-focus">-</span>
              )}
            </Col>
          </Row>
        </div>
      </Card>
    </StyledComponent>
  );
}

export default OrderShortDetails;
