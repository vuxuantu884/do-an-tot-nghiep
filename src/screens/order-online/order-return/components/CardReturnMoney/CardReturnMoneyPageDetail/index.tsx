import { Button, Card, Col, Row, Tag, Timeline } from "antd";
import { OrderPaymentResponse } from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import React from "react";
import { formatCurrency } from "utils/AppUtils";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { ORDER_PAYMENT_STATUS } from "utils/Order.constants";
import ReturnMoneySelect from "../ReturnMoneySelect";
import { StyledComponent } from "./styles";

type PropTypes = {
  listPaymentMethods: Array<PaymentMethodResponse>;
  payments: OrderPaymentResponse[];
  totalAmountReturnToCustomerLeft: number | undefined;
  handleReturnMoney: () => void;
  setIsShowPaymentMethod: (value: boolean) => void;
  isShowPaymentMethod: boolean;
  returnPaymentMethodCode: string;
  setReturnPaymentMethodCode: (value: string) => void;
  returnPaymentStatus: string;
};

function CardReturnMoneyPageDetail(props: PropTypes) {
  const {
    payments,
    totalAmountReturnToCustomerLeft = 0,
    listPaymentMethods,
    handleReturnMoney,
    setIsShowPaymentMethod,
    returnPaymentMethodCode,
    setReturnPaymentMethodCode,
    returnPaymentStatus,
    isShowPaymentMethod,
  } = props;

  const renderCardTitle = () => {
    return (
      <React.Fragment>
        <span className="title-card">
          Hoàn tiền
          {returnPaymentStatus === ORDER_PAYMENT_STATUS.paid && (
            <Tag
							color="success"
              className="orders-tag orders-tag-success"
              style={{
								marginLeft: 10,
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
    if (returnPaymentStatus === ORDER_PAYMENT_STATUS.paid || returnPaymentStatus === ORDER_PAYMENT_STATUS.partial_paid) {
      return (
        <Timeline>
          {payments.map((single, index) => {
            if(single.paid_amount === 0) {
              return null
            }
            return (
              <Timeline.Item key={index} color="#27AE60">
                <Row gutter={24}>
                  <Col md={8}>
                    <div className="timeline__colTitle 111">
                      <h3>{single.paid_amount < 0 ? "Hoàn tiền cho khách" : single.payment_method}</h3>
                    </div>
                  </Col>
                  <Col md={8} style={{ textAlign: "center" }}>
                    <strong className="po-payment-row-title">
                      {formatCurrency(Math.abs(single.paid_amount))}
                    </strong>
                  </Col>
                  <Col md={8} style={{ textAlign: "right" }}>
                    <span>{ConvertUtcToLocalDate(single.created_date, DATE_FORMAT.fullDate)}</span>
                  </Col>
                </Row>
              </Timeline.Item>
            );
          })}
        </Timeline>
      );
    } else {
      if(!isShowPaymentMethod) {
        return (
          <React.Fragment>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
              }}
            >
              Cần hoàn trả khách: {formatCurrency(totalAmountReturnToCustomerLeft)} đ
              <Button
                onClick={() => {
                  setIsShowPaymentMethod(true);
                }}
              >
                Hoàn tiền
              </Button>
            </div>
          </React.Fragment>
        );

      }
    }
  };

  return (
    <StyledComponent>
      <Card title={renderCardTitle()}>
        {renderPayments()}
        {returnPaymentStatus !== ORDER_PAYMENT_STATUS.paid && (
          <ReturnMoneySelect
            listPaymentMethods={listPaymentMethods}
            totalAmountCustomerNeedToPay={-totalAmountReturnToCustomerLeft}
            handleReturnMoney={() => {
              handleReturnMoney();
            }}
            isShowButtonReturnMoney={true}
            returnPaymentMethodCode={returnPaymentMethodCode}
            setReturnPaymentMethodCode={setReturnPaymentMethodCode}
          />
        )}
      </Card>
    </StyledComponent>
  );
}

export default CardReturnMoneyPageDetail;
