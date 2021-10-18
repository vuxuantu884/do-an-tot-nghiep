import { Card, Col, Row } from "antd";
import { OrderResponse } from "model/response/order/order.response";
import { StyledComponent } from "./styles";

type PropType = {
  OrderDetail: OrderResponse | null;
};

function SidebarOrderDetailInformation(props: PropType) {
  const { OrderDetail } = props;
  return (
    <StyledComponent>
      <Card title="THÔNG TIN ĐƠN HÀNG">
        <Row className="" gutter={5}>
          <Col span={10}>Cửa hàng:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 500, color: "#2A2A86" }} className="text-focus">
              {OrderDetail?.store}
            </span>
          </Col>
        </Row>
        <Row gutter={5}>
          <Col span={10}>Điện thoại:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 500, color: "#222222" }}>
              {OrderDetail?.customer_phone_number}
            </span>
          </Col>
        </Row>
        <Row gutter={5}>
          <Col span={10}>Địa chỉ:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 500, color: "#222222" }}>
              {OrderDetail?.shipping_address?.full_address}
            </span>
          </Col>
        </Row>
        <Row gutter={5}>
          <Col span={10}>Nhân viên bán hàng:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 500, color: "#222222" }} className="text-focus">
              {OrderDetail?.assignee}
            </span>
          </Col>
        </Row>
        <Row gutter={5}>
          <Col span={10}>Nhân viên marketing:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 500, color: "#222222" }} className="text-focus">
              {OrderDetail?.marketer}
            </span>
          </Col>
        </Row>
        {/* <Row gutter={5}>
          <Col span={10}>Nhân viên điều phối:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 500, color: "#222222" }} className="text-focus">
              {OrderDetail?.coordinator}
            </span>
          </Col>
        </Row> */}
        <Row gutter={5}>
          <Col span={10}>Người tạo:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 500, color: "#222222" }} className="text-focus">
              {OrderDetail?.account}
            </span>
          </Col>
        </Row>
        <Row gutter={5}>
          <Col span={10}>Đường dẫn:</Col>
          <Col span={14} style={{ wordWrap: "break-word" }}>
            {OrderDetail?.url ? (
              <a href={OrderDetail?.url}>{OrderDetail?.url}</a>
            ) : (
              <span className="text-focus">Không</span>
            )}
          </Col>
        </Row>
      </Card>
    </StyledComponent>
  );
}

export default SidebarOrderDetailInformation;
