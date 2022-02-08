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
              {OrderDetail?.utm_source}
            </span>
          </Col>
        </Row>
        <Row gutter={5}>
          <Col span={10} style={{ fontWeight: 400, color: "#737373" }}>utm_medium:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 400, color: "#222222" }} className="text-focus">
              {OrderDetail?.utm_medium}
            </span>
          </Col>
        </Row>
        <Row gutter={5}>
          <Col span={10} style={{ fontWeight: 400, color: "#737373" }}>utm_campain:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 400, color: "#222222" }} className="text-focus">
              {OrderDetail?.utm_campain}
            </span>
          </Col>
        </Row>
        <Row gutter={5}>
          <Col span={10} style={{ fontWeight: 400, color: "#737373" }}>utm_term:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 400, color: "#222222" }} className="text-focus">
              {OrderDetail?.utm_term}
            </span>
          </Col>
        </Row>
        <Row gutter={5}>
          <Col span={10} style={{ fontWeight: 400, color: "#737373" }}>utm_content:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 400, color: "#222222" }} className="text-focus">
              {OrderDetail?.utm_content}
            </span>
          </Col>
        </Row>
        <Row gutter={5}>
          <Col span={10} style={{ fontWeight: 400, color: "#737373" }}>Affiliate:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 400, color: "#222222" }} className="text-focus">
              {OrderDetail?.affiliate}
            </span>
          </Col>
        </Row>
      </Card>
    </StyledComponent>
  );
}

export default SidebarOrderDetailInformation;
