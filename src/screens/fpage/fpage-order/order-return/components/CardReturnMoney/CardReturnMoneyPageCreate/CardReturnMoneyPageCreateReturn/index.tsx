import { Card, Radio, Space } from "antd";
import { OrderPaymentRequest } from "model/request/order.request";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import React, { useMemo } from "react";
import { RETURN_MONEY_TYPE } from "utils/Order.constants";
import ReturnMoneySelect from "../../ReturnMoneySelect";

type PropType = {
  listPaymentMethods: Array<PaymentMethodResponse>;
  payments: OrderPaymentRequest[];
  totalAmountCustomerNeedToPay?: number;
  returnMoneyType?: string;
  setReturnMoneyType?: (value: string) => void;
};

/**
 * input: listPaymentMethod, returnMoneyType
 * output: setReturnMoneyType
 */
function CardReturnMoneyPageCreateReturn(props: PropType) {
  const {
    listPaymentMethods,
    payments,
    totalAmountCustomerNeedToPay,
    returnMoneyType,
    setReturnMoneyType,
  } = props;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const totalAmountReturn = () => {
    let total = 0;
    payments.forEach((p) => (total = total + p.amount));
    return total;
  };

  const moneyReturnLeft = useMemo(() => {
    if (totalAmountCustomerNeedToPay === undefined) {
      return 0;
    }
    let result = 0;
    result =
      totalAmountCustomerNeedToPay > 0
        ? totalAmountCustomerNeedToPay - totalAmountReturn()
        : -totalAmountCustomerNeedToPay - totalAmountReturn();
    return result;
  }, [totalAmountCustomerNeedToPay, totalAmountReturn]);

  return (
    <Card
      className="margin-top-20"
      title={<span className="title-card">Hoàn tiền</span>}
    >
      <div className="padding-20 create-order-payment">
        <Radio.Group
          value={returnMoneyType}
          onChange={(e) => {
            if (setReturnMoneyType) {
              setReturnMoneyType(e.target.value);
            }
          }}
          style={{ margin: "18px 0" }}
        >
          <Space size={20}>
            <Radio value={RETURN_MONEY_TYPE.return_now}>Hoàn tiền </Radio>
            <Radio value={RETURN_MONEY_TYPE.return_later}>Hoàn tiền sau</Radio>
          </Space>
        </Radio.Group>
        {returnMoneyType === RETURN_MONEY_TYPE.return_now && (
          <ReturnMoneySelect
            listPaymentMethods={listPaymentMethods}
            totalAmountCustomerNeedToPay={Math.round(moneyReturnLeft)}
            handleReturnMoney={() => {}}
            isShowButtonReturnMoney={false}
          />
        )}
      </div>
    </Card>
  );
}

export default CardReturnMoneyPageCreateReturn;
