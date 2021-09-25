import { Button, Card, Col, Row, Tag, Timeline } from "antd";
import { OrderPaymentResponse } from "model/response/order/order.response";
import React from "react";
import { ConvertUtcToLocalDate } from "utils/DateUtils";

type PropType = {
  payments: OrderPaymentResponse[];
  returnMoneyAmount: number;
};
function CardReturnMoneyPageDetail(props: PropType) {
  const { payments, returnMoneyAmount } = props;
  const renderCardTitle = () => {
    return (
      <React.Fragment>
        <span className="title-card">
          Hoàn tiền
          {payments && payments.length > 0 && (
            <Tag
              className="orders-tag orders-tag-success"
              style={{
                backgroundColor: "rgba(39, 174, 96, 0.1)",
                color: "#27AE60",
              }}
            >
              Đã thanh toán
            </Tag>
          )}
        </span>
      </React.Fragment>
    );
  };

  const renderPayments = () => {
    if (payments && payments.length) {
      return (
        <Timeline>
          {payments.map((single, index) => {
            return (
              <Timeline.Item key={index}>
                <Row gutter={24}>
                  <Col md={8}>
                    <div className="timeline__colTitle">
                      <h3>{single.payment_method}</h3>
                    </div>
                  </Col>
                  <Col md={8}>
                    <strong className="po-payment-row-title">
                      {single.amount}
                    </strong>
                  </Col>
                  <Col md={8}>
                    <strong>
                      {ConvertUtcToLocalDate(single.created_date)}
                    </strong>
                  </Col>
                </Row>
              </Timeline.Item>
            );
          })}
        </Timeline>
      );
    }
    return (
      <React.Fragment>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          Cần hoàn trả khách: {returnMoneyAmount} đ<Button>Hoàn tiền</Button>
        </div>
      </React.Fragment>
    );
  };

  return (
    <Card className="margin-top-20" title={renderCardTitle()}>
      <div className="padding-24">{renderPayments()}</div>
    </Card>
  );
}

export default CardReturnMoneyPageDetail;
