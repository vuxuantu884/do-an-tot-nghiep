import { Card, Col, Collapse, Divider, Radio, Row, Space } from "antd";
import OrderPayments from "component/order/OrderPayments";
import { getLoyaltyRate } from "domain/actions/loyalty/loyalty.action";
import { OrderPaymentRequest } from "model/request/order.request";
import { LoyaltyRateResponse } from "model/response/loyalty/loyalty-rate.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { formatCurrency, getAmountPayment } from "utils/AppUtils";
import { RETURN_MONEY_TYPE } from "utils/Order.constants";
import ReturnMoneySelect from "../ReturnMoneySelect";

type PropType = {
  listPaymentMethods: Array<PaymentMethodResponse>;
  payments: OrderPaymentRequest[];
  totalAmountCustomerNeedToPay: number;
  isExchange: boolean;
  isStepExchange: boolean;
  returnMoneyType?: string;
  setPayments: (value: Array<OrderPaymentRequest>) => void;
  setReturnMoneyType?: (value: string) => void;
};

/**
 * input: listPaymentMethod, returnMoneyType
 * output: setReturnMoneyType
 */
function CardReturnMoneyPageCreate(props: PropType) {
  const {
    listPaymentMethods,
    payments,
    totalAmountCustomerNeedToPay,
    isStepExchange,
    returnMoneyType,
    setPayments,
    setReturnMoneyType,
  } = props;

  const [loyaltyRate, setLoyaltyRate] = useState<LoyaltyRateResponse>();
  const dispatch = useDispatch()

  const isReturnMoneyToCustomer =
    totalAmountCustomerNeedToPay !== undefined && totalAmountCustomerNeedToPay <= 0;

	 /**
   * tổng số tiền đã trả
   */
		const totalAmountPayment = getAmountPayment(payments);

  const renderWhenReturnMoneyToCustomer = () => {
    return (
      <div className="create-order-payment">
        <Radio.Group
          value={returnMoneyType}
          onChange={(e) => {
            if (setReturnMoneyType) {
              setReturnMoneyType(e.target.value);
            }
          }}
          style={{margin: "0 0 18px 0"}}
        >
          <Space size={20}>
            <Radio value={RETURN_MONEY_TYPE.return_now}>Hoàn tiền </Radio>
            <Radio value={RETURN_MONEY_TYPE.return_later}>Hoàn tiền sau</Radio>
          </Space>
        </Radio.Group>
        {returnMoneyType === RETURN_MONEY_TYPE.return_now && (
          <ReturnMoneySelect
            listPaymentMethods={listPaymentMethods}
            totalAmountCustomerNeedToPay={
              totalAmountCustomerNeedToPay ? totalAmountCustomerNeedToPay : 0
            }
            handleReturnMoney={() => {}}
            isShowButtonReturnMoney={false}
          />
        )}
      </div>
    );
  };

  const renderWhenReturnCustomerNeedToPay = () => {
    return (
      <Row gutter={24}>
        <div style={{padding: "0 24px", maxWidth: "100%"}}>
          <Collapse className="orders-timeline" defaultActiveKey={["1"]} ghost>
            <Collapse.Panel
              className="orders-timeline-custom orders-dot-status"
              header={
                <span
                  style={{
                    textTransform: "uppercase",
                    fontWeight: 500,
                    color: "#222222",
                    padding: "6px",
                  }}
                >
                  Lựa chọn 1 hoặc nhiều phương thức thanh toán
                </span>
              }
              key="1"
              showArrow={false}
              // disabled={levelOrder > 2}
            >
              <div
                className="create-order-payment"
                style={{width: "1200px", maxWidth: "100%"}}
              >
                <Row gutter={24}>
                  <Col lg={10} xxl={7} className="margin-top-bottom-10">
                    <div>
                      <span style={{paddingRight: "20px"}}>
                        Tổng tiền cần thanh toán:{" "}
                      </span>
                      <strong>
                        {totalAmountCustomerNeedToPay &&
                          formatCurrency(Math.abs(totalAmountCustomerNeedToPay))}
                      </strong>
                    </div>
                  </Col>
                  <Col lg={10} xxl={7} className="margin-top-bottom-10">
                    <div>
                      <span style={{paddingRight: "20px"}}>Còn phải trả: </span>
                      <strong>
                        {formatCurrency(
                          (totalAmountCustomerNeedToPay-totalAmountPayment) > 0
                            ? (totalAmountCustomerNeedToPay-totalAmountPayment)
                            : 0
                        )}
                      </strong>
                    </div>
                  </Col>
                  <Divider style={{margin: "10px 0"}} />
                  <OrderPayments
                    payments={payments}
                    setPayments={setPayments}
                    totalAmountOrder={totalAmountCustomerNeedToPay}
                    loyaltyRate={loyaltyRate}
                    listPaymentMethod={listPaymentMethods}
                  />
                </Row>
              </div>
            </Collapse.Panel>
          </Collapse>
        </div>
      </Row>
    );
  };

  const renderIfIsExchange = () => {
    if (!isStepExchange) {
      return (
        <div>
          Đối với các đơn trả hàng để đổi hàng, bạn vui lòng thực hiện hoàn tiền/thanh
          toán trên đơn đổi hàng.
        </div>
      );
    } else {
      if (isReturnMoneyToCustomer) {
        return <div>{renderWhenReturnMoneyToCustomer()}</div>;
      } else {
        return <div>{renderWhenReturnCustomerNeedToPay()}</div>;
      }
    }
  };

  useEffect(() => {
    dispatch(getLoyaltyRate(setLoyaltyRate));
  }, [dispatch]);

  return (
    <Card title={isReturnMoneyToCustomer ? "Hoàn tiền" : "Thanh toán"}>
      {renderIfIsExchange()}
    </Card>
  );
}

export default CardReturnMoneyPageCreate;
