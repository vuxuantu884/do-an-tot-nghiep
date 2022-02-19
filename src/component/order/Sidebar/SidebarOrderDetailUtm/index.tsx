import { Card, Col, Row } from "antd";
import { OrderResponse } from "model/response/order/order.response";
import React from "react";
import { StyledComponent } from "./styles";

type PropType = {
  OrderDetail: OrderResponse | null;
};

function SidebarOrderDetailInformation(props: PropType) {
  const { OrderDetail } = props;
  return (
    <StyledComponent>
      <Card title="THÔNG TIN NGUỒN">
        <Row gutter={5}>
          <Col span={10} style={{ fontWeight: 400, color: "#737373" }}>utm_source:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 400, color: "#222222" }} className="text-focus">
              {OrderDetail?.utm_tracking?.utm_source}
            </span>
          </Col>
        </Row>
        <Row gutter={5}>
          <Col span={10} style={{ fontWeight: 400, color: "#737373" }}>utm_medium:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 400, color: "#222222" }} className="text-focus">
              {OrderDetail?.utm_tracking?.utm_medium}
            </span>
          </Col>
        </Row>
        <Row gutter={5}>
          <Col span={10} style={{ fontWeight: 400, color: "#737373" }}>utm_campaign:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 400, color: "#222222" }} className="text-focus">
              {OrderDetail?.utm_tracking?.utm_campaign}
            </span>
          </Col>
        </Row>
        <Row gutter={5}>
          <Col span={10} style={{ fontWeight: 400, color: "#737373" }}>utm_term:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 400, color: "#222222" }} className="text-focus">
              {OrderDetail?.utm_tracking?.utm_term}
            </span>
          </Col>
        </Row>
        <Row gutter={5}>
          <Col span={10} style={{ fontWeight: 400, color: "#737373" }}>utm_content:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 400, color: "#222222" }} className="text-focus">
              {OrderDetail?.utm_tracking?.utm_content}
            </span>
          </Col>
        </Row>
        <Row gutter={5}>
          <Col span={10} style={{ fontWeight: 400, color: "#737373" }}>Affiliate:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 400, color: "#222222" }} className="text-focus">
              {OrderDetail?.utm_tracking?.affiliate}
            </span>
          </Col>
        </Row>
      </Card>
    </StyledComponent>
  );
}

export default SidebarOrderDetailInformation;
