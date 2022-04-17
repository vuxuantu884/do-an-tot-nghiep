import { Card, Radio, Space } from "antd";
import OrderCreatePayments from "component/order/OrderCreatePayments";
import { getLoyaltyRate } from "domain/actions/loyalty/loyalty.action";
import { OrderPaymentRequest } from "model/request/order.request";
import { LoyaltyRateResponse } from "model/response/loyalty/loyalty-rate.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { RETURN_MONEY_TYPE } from "utils/Order.constants";
import ReturnMoneySelect from "../ReturnMoneySelect";

type PropType = {
  listPaymentMethods: Array<PaymentMethodResponse>;
  payments: OrderPaymentRequest[];
	totalAmountOrder: number;
  totalAmountCustomerNeedToPay: number;
  isExchange: boolean;
  isDisablePostPayment: boolean;
  returnMoneyType?: string;
	returnOrderInformation: {
		totalAmountReturn: number;
	};
  shipmentMethod: number;
  paymentMethod: number;
  setPayments: (value: Array<OrderPaymentRequest>) => void;
  setReturnMoneyType?: (value: string) => void;
  setPaymentMethod: (value: number) => void;
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
    returnMoneyType,
		totalAmountOrder,
		isDisablePostPayment,
    shipmentMethod,
    paymentMethod,
    returnOrderInformation,
    setPayments,
    setReturnMoneyType,
    setPaymentMethod,
  } = props;

  const [loyaltyRate, setLoyaltyRate] = useState<LoyaltyRateResponse>();
  
  const dispatch = useDispatch()

  const isReturnMoneyToCustomer =
    totalAmountCustomerNeedToPay !== undefined && totalAmountCustomerNeedToPay <= 0;

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
      <React.Fragment>
        <OrderCreatePayments
          setPaymentMethod={setPaymentMethod}
          payments={payments}
          setPayments={setPayments}
          paymentMethod={paymentMethod}
          shipmentMethod={shipmentMethod}
          totalAmountOrder={Math.abs(totalAmountOrder - returnOrderInformation.totalAmountReturn)}
          loyaltyRate={loyaltyRate}
          isDisablePostPayment={isDisablePostPayment}
          listPaymentMethod={listPaymentMethods}
          isOrderReturnFromPOS
        />
      </React.Fragment>
    );
  };

  const renderIfIsExchange = () => {
    if (isReturnMoneyToCustomer) {
      return <div>{renderWhenReturnMoneyToCustomer()}</div>;
    } else {
      return <div>{renderWhenReturnCustomerNeedToPay()}</div>;
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
