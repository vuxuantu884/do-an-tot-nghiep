import { Button, Card, Col, Row, Tag, Timeline } from "antd";
import { OrderPaymentResponse } from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import React, { useState } from "react";
import { formatCurrency } from "utils/AppUtils";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import ReturnMoneySelect from "../ReturnMoneySelect";
import { StyledComponent } from "./styles";

type PropType = {
  listPaymentMethods: Array<PaymentMethodResponse>;
  payments: OrderPaymentResponse[];
  returnMoneyAmount: number;
};
function CardReturnMoneyPageDetail(props: PropType) {
  const { payments, returnMoneyAmount, listPaymentMethods } = props;
  const [isShowPayment, setIsShowPayment] = useState(false);
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
              Đã hoàn tiền
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
              <Timeline.Item key={index} color="#27AE60">
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: "bold",
          }}
        >
          Cần hoàn trả khách: {formatCurrency(returnMoneyAmount)} đ
          <Button
            onClick={() => {
              setIsShowPayment(true);
            }}
          >
            Hoàn tiền
          </Button>
        </div>
      </React.Fragment>
    );
  };

  return (
    <StyledComponent>
      <Card className="margin-top-20" title={renderCardTitle()}>
        <div className="padding-24">
          {renderPayments()}
          {isShowPayment && (
            <ReturnMoneySelect
              listPaymentMethods={listPaymentMethods}
              totalAmountCustomerNeedToPay={returnMoneyAmount}
              handleReturnMoney={() => {}}
              isShowButtonReturnMoney={true}
            />
          )}
        </div>
      </Card>
    </StyledComponent>
  );
}

export default CardReturnMoneyPageDetail;
