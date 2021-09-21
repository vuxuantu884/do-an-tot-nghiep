import { Card, Col, Row, Timeline } from "antd";
import { OrderPaymentRequest } from "model/request/order.request";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import React from "react";
import { ConvertUtcToLocalDate } from "utils/DateUtils";

type PropType = {
  listPaymentMethods: Array<PaymentMethodResponse>;
  amountReturn: number;
  payments: OrderPaymentRequest[];
  handlePayments: (value: Array<OrderPaymentRequest>) => void;
};
function CardReturnMoneyPageDetail(props: PropType) {
  return (
    <Card
      className="margin-top-20"
      title={<span className="title-card">Hoàn tiền</span>}
    >
      <div className="padding-24">
        <Timeline>
          <Timeline.Item>
            <Row gutter={24}>
              <Col md={8}>
                <div className="timeline__colTitle">
                  <h3>Tiền mặt</h3>
                </div>
              </Col>
              <Col md={8}>
                <strong className="po-payment-row-title">50.000</strong>
              </Col>
              <Col md={8}>
                <strong>{ConvertUtcToLocalDate("2021-09-15T13:56:09Z")}</strong>
              </Col>
            </Row>
          </Timeline.Item>
          <Timeline.Item>
            <Row gutter={24}>
              <Col md={8}>
                <div className="timeline__colTitle">
                  <h3>Tiền mặt</h3>
                </div>
              </Col>
              <Col md={8}>
                <strong className="po-payment-row-title">50.000</strong>
              </Col>
              <Col md={8}>
                <strong>{ConvertUtcToLocalDate("2021-09-15T13:56:09Z")}</strong>
              </Col>
            </Row>
          </Timeline.Item>
        </Timeline>
      </div>
    </Card>
  );
}

export default CardReturnMoneyPageDetail;
